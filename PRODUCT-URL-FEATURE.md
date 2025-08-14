# Product URL Feature Documentation

## Overview
The Product URL feature allows users to add web links to their products, making product names clickable links that open the product pages in new tabs.

## Features Added

### 1. Database Schema Update
- Added `url?: string` field to the Product interface
- Field is optional and defaults to null/empty

### 2. UI Components Updated

#### AddProductForm Component
- **New Field**: Product URL input field
- **Type**: URL input with validation
- **Placement**: Between Product Name and Order Date fields
- **Validation**: Uses HTML5 URL input type for basic validation

#### EditableProductRow Component
- **Mobile Layout**: URL input field added after Product Name
- **Desktop Layout**: URL input field added as second column
- **Functionality**: Full editing support for URLs

#### ProductTable Component
- **New Column**: URL column added after Item column
- **Mobile Layout**: Product names become clickable links when URL is provided
- **Desktop Layout**: 
  - Product names become clickable links when URL is provided
  - Dedicated URL column shows truncated URLs (30 chars) with tooltips
  - URLs are clickable and open in new tabs

### 3. User Experience

#### Clickable Product Names
- When a product has a URL, the product name becomes a blue clickable link
- Links open in new tabs (`target="_blank"`)
- Links include security attributes (`rel="noopener noreferrer"`)
- Hover effects provide visual feedback

#### URL Display
- **Desktop**: Dedicated URL column shows truncated URLs for space efficiency
- **Mobile**: URL field available in edit mode
- **No URL**: Shows "No URL" placeholder text
- **Long URLs**: Automatically truncated with "..." and full URL in tooltip

## Technical Implementation

### Type Safety
```typescript
interface Product {
  id?: string;
  item: string;
  url?: string; // NEW: Optional URL field
  orderDate: string | null;
  // ... other fields
}
```

### Link Component Pattern
```tsx
{product.url ? (
  <a 
    href={product.url} 
    target="_blank" 
    rel="noopener noreferrer"
    className="font-semibold text-blue-600 hover:text-blue-800 underline"
  >
    {product.item}
  </a>
) : (
  <strong>{product.item}</strong>
)}
```

## Usage Instructions

### Adding URLs to New Products
1. Click "Add Product" button
2. Fill in Product Name (required)
3. Add Product URL (optional) - paste the full product URL
4. Complete other fields as needed
5. Click "Add Product"

### Adding URLs to Existing Products
1. Click the "..." menu for any product row
2. Select "Edit"
3. Add or modify the Product URL field
4. Click "Save Changes"

### Using Clickable Links
- Product names with URLs appear as blue underlined links
- Click any linked product name to open the product page
- Links open in new browser tabs for convenience

## Migration for Existing Data

If you have existing products in your database, run the migration script:

```bash
cd scripts
node add-url-field-migration.js
```

This will add the `url` field (set to `null`) to all existing products without affecting other data.

## Best Practices

### URL Format
- Use complete URLs including protocol: `https://amazon.com/dp/B123456789`
- Amazon product URLs work best for Amazon product tracking
- Other retailer URLs are also supported

### Security
- All external links use `rel="noopener noreferrer"` for security
- URLs are validated using HTML5 URL input type
- No script execution or XSS vulnerabilities

### Performance
- URLs are stored as simple strings
- No impact on existing filtering or sorting functionality
- Minimal additional database storage requirements

## Future Enhancements

Potential future improvements:
- URL validation and formatting assistance
- Automatic URL detection from receipt data
- Bulk URL import functionality
- URL health checking (detect broken links)
- Integration with product APIs for auto-population
