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

    // 1. Extract Date - Look for "Order placed [Month Day, Year]" pattern
    const datePatterns = [
      /Order placed\s+([A-Za-z]+ \d{1,2}, \d{4})/i,
      /placed\s+([A-Za-z]+ \d{1,2}, \d{4})/i,
      /([A-Za-z]+ \d{1,2}, \d{4})/g
    ];

    for (const pattern of datePatterns) {
      const matches = cleanText.match(pattern);
      if (matches) {
        orderData.orderDate = matches[1] || matches[0];
        break;
      }
    }

    // 2. Extract Grand Total - Look for "Grand Total: $XX.XX" pattern
    const totalPatterns = [
      /Grand Total:\s*\$?([\d.,]+)/i,
      /Grand Total\s*\$?([\d.,]+)/i,
      /Total:\s*\$?([\d.,]+)/i
    ];

    for (const pattern of totalPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        orderData.orderTotal = parseFloat(match[1].replace(/[,$]/g, ''));
        break;
      }
    }

    // 3. Extract Product Title - Look for lines after "Delivered" and before "Sold by"
    // Strategy: Find the longest meaningful text line that appears in the product section
    let productTitle = null;
    
    // Method 1: Look for text between "Delivered [date]" and "Sold by"
    const deliveredMatch = cleanText.match(/Delivered\s+[A-Za-z]+ \d+\s+(.*?)\s+Sold by/i);
    if (deliveredMatch && deliveredMatch[1] && deliveredMatch[1].length > 15) {
      productTitle = deliveredMatch[1].trim();
    }

    // Method 2: If not found, look for the longest line that contains product-like keywords
    if (!productTitle) {
      const productKeywords = [
        'women', 'men', 'kids', 'black', 'white', 'blue', 'red', 'pink',
        'tank', 'tops', 'shirt', 'underwear', 'briefs', 'alarm', 'clock',
        'light', 'pack', 'set', 'for', 'with', 'cotton', 'yoga', 'workout',
        'sleeveless', 'moisture', 'wicking', 'athletic', 'open', 'back'
      ];

      let bestMatch = '';
      let bestScore = 0;

      for (const line of lines) {
        if (line.length > 20 && line.length < 200) {
          // Count keyword matches
          const keywordCount = productKeywords.filter(keyword => 
            line.toLowerCase().includes(keyword.toLowerCase())
          ).length;
          
          // Prefer longer lines with more keywords
          const score = keywordCount * 10 + line.length;
          
          if (score > bestScore && !line.includes('$') && !line.includes('Sold by')) {
            bestScore = score;
            bestMatch = line;
          }
        }
      }

      if (bestMatch && bestScore > 20) {
        productTitle = bestMatch.trim();
      }
    }

    // Method 3: Look for lines that start with capital letter and contain common product patterns
    if (!productTitle) {
      for (const line of lines) {
        if (line.length > 20 && 
            /^[A-Z]/.test(line) && 
            !line.includes('$') && 
            !line.includes('Order') && 
            !line.includes('Ship') && 
            !line.includes('Payment') &&
            !line.includes('Sold by') &&
            !line.includes('Return') &&
            (line.includes('for') || line.includes('with') || line.includes('-') || line.includes(','))) {
          productTitle = line.trim();
          break;
        }
      }
    }

    // Add the product to items if found
    if (productTitle) {
      orderData.items.push({
        quantity: 1,
        name: productTitle,
        price: orderData.orderTotal || 0
      });
    }

    // Extract order number if available
    const orderNumberMatch = cleanText.match(/Order #?\s*([0-9-]+)/i);
    if (orderNumberMatch) {
      orderData.orderNumber = orderNumberMatch[1];
    }

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
