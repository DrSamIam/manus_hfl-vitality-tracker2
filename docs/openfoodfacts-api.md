# Open Food Facts API Reference

## Barcode Lookup Endpoint

Get product by barcode:
```
GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json
```

Example:
```
https://world.openfoodfacts.org/api/v2/product/737628064502.json
```

## Limit Response Fields

Use the `fields` parameter to get only specific product data:
```
https://world.openfoodfacts.org/api/v2/product/3017620422003.json?fields=product_name,brands,nutriments
```

## Rate Limits
- 100 req/min for all read product queries
- 10 req/min for search queries
- 2 req/min for facet queries

## Authentication
- READ operations do not require authentication
- Use custom User-Agent: `AppName/Version (ContactEmail)`

## Response Fields for Supplements
Useful fields:
- `product_name` - Product name
- `brands` - Brand name
- `ingredients_text` - Ingredients list
- `nutriments` - Nutritional information
- `serving_size` - Serving size
- `categories` - Product categories
- `image_url` - Product image
