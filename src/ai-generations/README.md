# AI Generations Module

This module provides AI-powered image generation capabilities using Replicate API.

## Features

- **Multi-Image Generation**: Combine two images with a text prompt
- **Professional Headshot Generation**: Create professional headshots from a normal photo
- **Change Hairstyle**: Change haircut and hair color in a portrait image
- **Image Upscaler**: Restore and enhance low-quality images
- **Payment System**: Purchase credits and tokens for AI generations

## Setup

1. Make sure you have a valid Replicate API token
2. Add it to your environment variables as `REPLICATE_API_TOKEN`
3. Configure FlexPay payment gateway settings in your environment variables

```bash
# .env
REPLICATE_API_TOKEN=your_replicate_api_token
FLEX_PAY_API_KEY=your_api_key
FLEX_PAY_WEBHOOK_URL=your_webhook_url
FLEX_PAY_MERCHANT=your_merchant_id
```

## Usage

### Multi-Image Generation

```typescript
// Example API request
POST /ai-generations/multi-image
{
  "prompt": "Put the woman into a white t-shirt with the text on it",
  "aspect_ratio": "1:1",
  "input_image_1": "https://example.com/image1.png",
  "input_image_2": "https://example.com/image2.png"
}
```

### Professional Headshot Generation

```typescript
// Example API request
POST /ai-generations/professional-photo
{
  "gender": "female",
  "input_image": "https://example.com/image.png",
  "aspect_ratio": "1:1"
}
```

### Change Hairstyle

```typescript
// Example API request
POST /ai-generations/change-hairstyle
{
  "haircut": "Random", // Optional, defaults to "Random"
  "hair_color": "Random", // Optional, defaults to "Random"
  "input_image": "https://example.com/image.png"
}
```

### Image Upscaler

```typescript
// Example API request
POST /ai-generations/upscale-image
{
  "input_image": "https://example.com/image.png"
}
```

### Purchase Credits

```typescript
// Example API request
POST /ai-generations/payment
{
  "amount": 10,
  "phoneNumber": "243123456789",
  "type": "credit_purchase",
  "currency": "USD"
}
```

### Check Balance

```typescript
// Example API request
GET /ai-generations/payment/balance
```

## Response Format

All generation endpoints return a response with the following structure:

```typescript
{
  "url": "https://replicate.delivery/path/to/generated/image.png"
}
```

## Models Used

- Multi-Image: `flux-kontext-apps/multi-image-kontext`
- Professional Headshot: `flux-kontext-apps/professional-headshot`
- Change Hairstyle: `flux-kontext-apps/change-haircut`
- Image Upscaler: `flux-kontext-apps/restore-image`

## Credits System

Each image generation requires 1 generation credit from the user's account. Users can purchase credits through the payment system. 