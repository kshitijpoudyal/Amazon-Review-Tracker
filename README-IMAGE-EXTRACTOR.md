# Image Data Extractor

This tool extracts text and structured data from images using OCR (Optical Character Recognition). It's specifically designed to handle Amazon order receipts and general text extraction.

## Features

### 🛒 Amazon Order Receipt Parsing
- **Order Information**: Order number, date, and total amount
- **Shipping Details**: Customer name, address, and shipping method
- **Items**: Product names, quantities, and prices
- **Payment Info**: Payment method details

### 📄 General Text Extraction
- **Contact Information**: Email addresses and phone numbers
- **Dates**: Various date formats (MM/DD/YYYY, YYYY-MM-DD, Month DD, YYYY)
- **Monetary Amounts**: Currency values and prices
- **Raw Text**: Complete OCR text extraction

## Usage

### Command Line Script

```bash
# Extract from Amazon order receipt
npm run extract-image path/to/receipt.jpg amazon-order

# General text extraction
npm run extract-image path/to/document.png general

# Save results to JSON file
npm run extract-image path/to/image.jpg amazon-order extracted-data.json
```

### React Component Integration

```tsx
import { ImageUploader } from './components/ImageUploader';

function App() {
  const handleDataExtracted = (data) => {
    console.log('Extracted data:', data);
    
    // Handle Amazon order data
    if (data.orderData) {
      console.log('Order:', data.orderData.orderNumber);
      console.log('Items:', data.orderData.items);
    }
  };

  return (
    <ImageUploader onDataExtracted={handleDataExtracted} />
  );
}
```

### React Hook

```tsx
import { useImageDataExtractor } from './hooks/useImageDataExtractor';

function MyComponent() {
  const { extractDataFromImage, isLoading, error } = useImageDataExtractor();

  const handleFileUpload = async (file: File) => {
    const result = await extractDataFromImage(file, 'amazon-order');
    console.log(result);
  };

  return (
    <div>
      {isLoading && <p>Processing...</p>}
      {error && <p>Error: {error}</p>}
      <input type="file" onChange={e => handleFileUpload(e.target.files[0])} />
    </div>
  );
}
```

## Extracted Data Structure

### Amazon Order Data
```json
{
  "rawText": "Complete OCR text...",
  "orderData": {
    "orderNumber": "112-6133423-9920252",
    "orderDate": "August 10, 2025",
    "orderTotal": 44.29,
    "shippingAddress": {
      "name": "Asmita Neupane",
      "street": "603 BOND ST 206",
      "cityStateZip": "RUSTON, LA 71270-4901",
      "country": "United States"
    },
    "items": [
      {
        "quantity": 1,
        "name": "NIOWS Solar Pathway Lights Outdoor Waterproof - 8 Pack",
        "price": 39.90
      }
    ],
    "paymentInfo": {
      "method": "Amazon Visa ending in 2943"
    }
  }
}
```

### General Data
```json
{
  "rawText": "Complete OCR text...",
  "generalData": {
    "emails": ["user@example.com"],
    "phoneNumbers": ["+1-555-123-4567"],
    "dates": ["08/10/2025", "August 10, 2025"],
    "amounts": [44.29, 39.90, 4.39]
  }
}
```

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install tesseract.js
   ```

2. **File Structure**:
   ```
   src/
   ├── hooks/
   │   └── useImageDataExtractor.ts
   ├── components/
   │   ├── ImageUploader.tsx
   │   └── ImageExtractorDemo.tsx
   └── scripts/
       └── image-data-extractor.js
   ```

## Performance Tips

### Image Quality
- Use high-resolution images (300+ DPI recommended)
- Ensure good contrast between text and background
- Avoid skewed or rotated images
- Proper lighting reduces shadows and glare

### File Formats
- **Supported**: PNG, JPG, JPEG, GIF, WebP, BMP, TIFF
- **Max Size**: 10MB per image
- **Recommended**: PNG or high-quality JPEG

### Processing Time
- Small images (< 1MB): 2-5 seconds
- Large images (5-10MB): 10-30 seconds
- Complex layouts: May take longer

## Integration Examples

### Add to Existing Dashboard

```tsx
// In your product dashboard component
import { ImageUploader } from './components/ImageUploader';
import { useProductCrudFirebase } from './hooks/useProductCrudFirebase';

function ProductDashboard() {
  const { addProduct } = useProductCrudFirebase();

  const handleOrderExtracted = async (data) => {
    if (data.orderData?.items) {
      // Convert extracted items to product format
      for (const item of data.orderData.items) {
        await addProduct({
          name: item.name,
          price: item.price,
          // Add other required fields...
        });
      }
    }
  };

  return (
    <div>
      <h2>Import from Receipt</h2>
      <ImageUploader 
        onDataExtracted={handleOrderExtracted}
        className="mb-4"
      />
      {/* Rest of your dashboard */}
    </div>
  );
}
```

### Batch Processing

```javascript
// Process multiple images
const processMultipleImages = async (imageFiles) => {
  const extractor = new ImageDataExtractor();
  await extractor.initialize();

  const results = [];
  for (const file of imageFiles) {
    try {
      const result = await extractor.processImage(file.path, 'amazon-order');
      results.push(result);
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
    }
  }

  await extractor.cleanup();
  return results;
};
```

## Error Handling

Common issues and solutions:

1. **OCR Worker Initialization Failed**
   - Check internet connection (Tesseract.js downloads models)
   - Ensure sufficient memory available

2. **Poor Text Recognition**
   - Improve image quality
   - Increase image resolution
   - Adjust lighting/contrast

3. **Parsing Errors**
   - Check if image matches expected format
   - Verify regex patterns for your use case
   - Add custom parsing logic

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Limited by device memory

## License

Part of the Amazon Review Dashboard project.
