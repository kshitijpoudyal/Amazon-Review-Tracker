import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';

interface ExtractedOrderData {
  orderNumber: string | null;
  orderDate: string | null;
  orderTotal: number | null;
  shippingAddress: {
    name?: string;
    street?: string;
    cityStateZip?: string;
    country?: string;
  };
  items: Array<{
    quantity: number;
    name: string;
    price: number;
  }>;
  paymentInfo: {
    method?: string;
  };
}

interface ImageExtractionResult {
  rawText: string;
  orderData?: ExtractedOrderData;
  generalData?: Record<string, any>;
  error?: string;
}

export const useImageDataExtractor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Helper function to extract order date from different layouts
  const extractOrderDate = (cleanText: string, _lines: string[]): string | null => {
    const datePatterns = [
      /Order placed\s+([A-Za-z]+ \d{1,2}, \d{4})/i,
      /placed\s+([A-Za-z]+ \d{1,2}, \d{4})/i,
      /Order placed\s+([A-Za-z]+ \d{1,2}, \d{4})/i,
      /([A-Za-z]+ \d{1,2}, \d{4})/g
    ];

    for (const pattern of datePatterns) {
      const matches = cleanText.match(pattern);
      if (matches) {
        const date = matches[1] || matches[0];
        // Validate it's a reasonable date format
        if (date && date.length > 8) {
          return date.trim();
        }
      }
    }
    return null;
  };

  // Helper function to extract order number with enhanced patterns
  const extractOrderNumber = (cleanText: string, _lines: string[]): string | null => {
    const orderNumberPatterns = [
      /Order #\s*([0-9-]+)/i,
      /Order Number:?\s*([0-9-]+)/i,
      /Order #?\s*([0-9-]+)/i,
      /#\s*([0-9-]{10,})/i,
      /(\d{3}-\d{7}-\d{7})/g, // Amazon format XXX-XXXXXXX-XXXXXXX (like 112-9101337-0744250)
      /(\d{3}-\d{6,8}-\d{6,8})/g, // Variations of Amazon format
      /Order:\s*([0-9-]+)/i
    ];

    for (const pattern of orderNumberPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        const orderNum = match[1].trim();
        // Validate order number length and format - Amazon orders are typically 15+ chars
        if (orderNum.length >= 12 && orderNum.includes('-')) {
          return orderNum;
        }
      }
    }
    return null;
  };

  // Helper function to extract grand total with multiple approaches
  const extractGrandTotal = (cleanText: string, _lines: string[]): number | null => {
    const totalPatterns = [
      /Grand Total:\s*\$?([\d.,]+)/i,
      /Grand Total\s*\$?([\d.,]+)/i,
      /Total:\s*\$?([\d.,]+)/i,
      /Grand Total\s*\$?([\d.,]+)/i
    ];

    for (const pattern of totalPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        const total = parseFloat(match[1].replace(/[,$]/g, ''));
        if (!isNaN(total) && total > 0) {
          return total;
        }
      }
    }
    return null;
  };

  // Enhanced product information extraction for different layouts
  const extractProductInformation = (_cleanText: string, lines: string[]): {
    title: string;
    quantity?: number;
    price?: number;
  } | null => {
    
    // Method 1: Look for product titles with enhanced pattern matching
    // Handle both layout variants - mobile (stacked) and desktop (horizontal)
    const productCandidates = lines.filter(line => {
      const cleanLine = line.trim();
      
      return cleanLine.length > 15 &&
        cleanLine.length < 400 &&
        !cleanLine.includes('$') &&
        !cleanLine.toLowerCase().includes('order placed') &&
        !cleanLine.toLowerCase().includes('order #') &&
        !cleanLine.toLowerCase().includes('ship to') &&
        !cleanLine.toLowerCase().includes('payment method') &&
        !cleanLine.toLowerCase().includes('sold by:') &&
        !cleanLine.toLowerCase().includes('supplied by:') &&
        !cleanLine.toLowerCase().includes('arriving') &&
        !cleanLine.toLowerCase().includes('track package') &&
        !cleanLine.toLowerCase().includes('cancel items') &&
        !cleanLine.toLowerCase().includes('view invoice') &&
        !cleanLine.toLowerCase().includes('change') &&
        !cleanLine.toLowerCase().includes('buy it again') &&
        !cleanLine.toLowerCase().includes('ask product') &&
        !cleanLine.toLowerCase().includes('write a product') &&
        !cleanLine.toLowerCase().includes('subtotal') &&
        !cleanLine.toLowerCase().includes('shipping') &&
        !cleanLine.toLowerCase().includes('grand total') &&
        !cleanLine.toLowerCase().includes('estimated tax') &&
        !cleanLine.toLowerCase().includes('total before tax') &&
        // Must be descriptive (contain multiple words or product indicators)
        (cleanLine.split(' ').length >= 3 || 
         /\b(tier|acrylic|coffee|station|organizer|countertop|kitchen|counter|holder|bags|mugs|cups|syrup|sugar|condiment|storage|rack|multifunctional|shelf|accessories|bar)\b/i.test(cleanLine));
    });

    // Sort by length and keyword relevance with enhanced scoring
    const scoredCandidates = productCandidates.map(line => {
      const lowercaseLine = line.toLowerCase();
      
      // High-value product keywords (from your examples)
      const highValueKeywords = [
        'tier', 'acrylic', 'coffee', 'station', 'organizer', 'countertop', 'kitchen',
        'counter', 'holder', 'bags', 'mugs', 'cups', 'syrup', 'sugar', 'condiment',
        'storage', 'rack', 'multifunctional', 'shelf', 'accessories', 'bar'
      ];
      
      // General product keywords
      const generalKeywords = [
        'women', 'men', 'kids', 'black', 'white', 'blue', 'red', 'pink',
        'tank', 'tops', 'shirt', 'underwear', 'briefs', 'light', 'pack', 'set',
        'for', 'with'
      ];
      
      // Count keyword matches with different weights
      const highValueMatches = highValueKeywords.filter(keyword => 
        lowercaseLine.includes(keyword)
      ).length;
      
      const generalMatches = generalKeywords.filter(keyword => 
        lowercaseLine.includes(keyword)
      ).length;
      
      // Bonus for descriptive patterns
      const descriptiveBonus = 
        (lowercaseLine.includes(' for ') ? 10 : 0) +
        (lowercaseLine.includes(' with ') ? 8 : 0) +
        (line.split(' ').length >= 8 ? 15 : 0) + // Long descriptive titles
        (line.split(' ').length >= 12 ? 10 : 0); // Very long titles
      
      // Penalty for certain patterns
      const penalties = 
        (lowercaseLine.includes('aileming') ? -5 : 0) + // Seller name
        (line.length < 30 ? -10 : 0); // Too short
      
      // Calculate final score
      const score = 
        (highValueMatches * 25) + 
        (generalMatches * 8) + 
        (line.length * 0.8) + 
        descriptiveBonus + 
        penalties;
      
      return { line: line.trim(), score };
    });

    // Get the highest scoring candidate
    if (scoredCandidates.length > 0) {
      const bestCandidate = scoredCandidates.sort((a, b) => b.score - a.score)[0];
      if (bestCandidate.score > 25) {
        return {
          title: bestCandidate.line.trim(),
          quantity: 1
        };
      }
    }

    // Method 2: Fallback - look for any long descriptive line
    const fallbackCandidate = lines.find(line => 
      line.length > 30 && 
      line.length < 200 && 
      !line.includes('$') && 
      /^[A-Z0-9]/.test(line) &&
      !line.toLowerCase().includes('order') &&
      !line.toLowerCase().includes('ship')
    );

    if (fallbackCandidate) {
      return {
        title: fallbackCandidate.trim(),
        quantity: 1
      };
    }

    return null;
  };

  // Extract shipping address information
  const extractShippingAddress = (cleanText: string, _lines: string[]): {
    name?: string;
    street?: string;
    cityStateZip?: string;
    country?: string;
  } | null => {
    const addressInfo: any = {};
    
    // Look for name patterns (usually after "Ship to")
    const nameMatch = cleanText.match(/Ship to\s+([A-Za-z\s]+)\s+\d/i);
    if (nameMatch && nameMatch[1]) {
      addressInfo.name = nameMatch[1].trim();
    }

    // Look for street address patterns
    const streetMatch = cleanText.match(/(\d+\s+[A-Za-z\s]+(?:ST|STREET|AVE|AVENUE|RD|ROAD|BLVD|BOULEVARD|DR|DRIVE|LN|LANE|CT|COURT)\s+\w*)/i);
    if (streetMatch && streetMatch[1]) {
      addressInfo.street = streetMatch[1].trim();
    }

    // Look for city, state, zip patterns
    const cityStateZipMatch = cleanText.match(/([A-Za-z\s]+,\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?)/i);
    if (cityStateZipMatch && cityStateZipMatch[1]) {
      addressInfo.cityStateZip = cityStateZipMatch[1].trim();
    }

    // Look for country
    if (cleanText.toLowerCase().includes('united states')) {
      addressInfo.country = 'United States';
    }

    return Object.keys(addressInfo).length > 0 ? addressInfo : null;
  };

  // Extract payment method information
  const extractPaymentMethod = (cleanText: string, _lines: string[]): {
    method?: string;
  } | null => {
    const paymentPatterns = [
      /Amazon\s+Visa\s+ending\s+in\s+(\d{4})/i,
      /Visa\s+ending\s+in\s+(\d{4})/i,
      /Mastercard\s+ending\s+in\s+(\d{4})/i,
      /ending\s+in\s+(\d{4})/i
    ];

    for (const pattern of paymentPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        return {
          method: match[0].trim()
        };
      }
    }

    return null;
  };

  const parseAmazonOrder = useCallback((text: string): ExtractedOrderData => {
    const orderData: ExtractedOrderData = {
      orderNumber: null,
      orderDate: null,
      orderTotal: null,
      shippingAddress: {},
      items: [],
      paymentInfo: {}
    };

    // Clean and normalize the text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    console.log('🔍 Processing Amazon receipt text...');
    console.log('📄 Extracted lines count:', lines.length);

    // Enhanced extraction approach for different layout variants
    orderData.orderDate = extractOrderDate(cleanText, lines);
    orderData.orderNumber = extractOrderNumber(cleanText, lines);
    orderData.orderTotal = extractGrandTotal(cleanText, lines);
    
    console.log('📅 Extracted date:', orderData.orderDate);
    console.log('🔢 Extracted order number:', orderData.orderNumber);
    console.log('💰 Extracted total:', orderData.orderTotal);
    
    const productInfo = extractProductInformation(cleanText, lines);
    if (productInfo) {
      console.log('📦 Extracted product:', productInfo.title);
      orderData.items.push({
        quantity: productInfo.quantity || 1,
        name: productInfo.title,
        price: productInfo.price || orderData.orderTotal || 0
      });
    } else {
      console.log('❌ No product information extracted');
    }

    const addressInfo = extractShippingAddress(cleanText, lines);
    if (addressInfo) {
      console.log('🏠 Extracted address info:', addressInfo);
      orderData.shippingAddress = addressInfo;
    }

    const paymentInfo = extractPaymentMethod(cleanText, lines);
    if (paymentInfo) {
      console.log('💳 Extracted payment info:', paymentInfo);
      orderData.paymentInfo = paymentInfo;
    }

    console.log('✅ Final extracted data:', orderData);
    return orderData;
  }, []);

  const extractDataFromImage = useCallback(async (
    file: File,
    type: 'amazon-order' | 'general' = 'general'
  ): Promise<ImageExtractionResult> => {
    setIsLoading(true);
    setError(null);

    let worker;
    try {
      // Create OCR worker
      worker = await createWorker('eng');
      
      // Convert file to image for processing
      const imageUrl = URL.createObjectURL(file);
      
      // Extract text from image
      const { data: { text } } = await worker.recognize(imageUrl);
      
      // Store raw text for debugging
      setDebugInfo(text);
      
      // Clean up object URL
      URL.revokeObjectURL(imageUrl);

      const result: ImageExtractionResult = {
        rawText: text
      };

      // Parse based on type
      if (type === 'amazon-order') {
        result.orderData = parseAmazonOrder(text);
      } else {
        // Extract general patterns
        const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const phonePattern = /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g;
        const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|[A-Za-z]+ \d{1,2}, \d{4})/g;
        const amountPattern = /\$?([\d,]+\.?\d{0,2})/g;

        result.generalData = {
          emails: text.match(emailPattern) || [],
          phoneNumbers: text.match(phonePattern) || [],
          dates: text.match(datePattern) || [],
          amounts: (text.match(amountPattern) || []).map((amount: string) => 
            parseFloat(amount.replace(/[$,]/g, ''))
          )
        };
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        rawText: '',
        error: errorMessage
      };
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setIsLoading(false);
    }
  }, [parseAmazonOrder]);

  const extractFromImageUrl = useCallback(async (
    imageUrl: string,
    type: 'amazon-order' | 'general' = 'general'
  ): Promise<ImageExtractionResult> => {
    setIsLoading(true);
    setError(null);

    let worker;
    try {
      worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(imageUrl);

      // Store raw text for debugging
      setDebugInfo(text);

      const result: ImageExtractionResult = {
        rawText: text
      };

      console.log('Extracted text:', text);

      if (type === 'amazon-order') {
        result.orderData = parseAmazonOrder(text);
      } else {
        // Extract general patterns
        const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const phonePattern = /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g;
        const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|[A-Za-z]+ \d{1,2}, \d{4})/g;
        const amountPattern = /\$?([\d,]+\.?\d{0,2})/g;

        result.generalData = {
          emails: text.match(emailPattern) || [],
          phoneNumbers: text.match(phonePattern) || [],
          dates: text.match(datePattern) || [],
          amounts: (text.match(amountPattern) || []).map((amount: string) => 
            parseFloat(amount.replace(/[$,]/g, ''))
          )
        };
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        rawText: '',
        error: errorMessage
      };
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setIsLoading(false);
    }
  }, [parseAmazonOrder]);

  return {
    extractDataFromImage,
    extractFromImageUrl,
    isLoading,
    error,
    debugInfo
  };
};
