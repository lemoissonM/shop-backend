# AI Generations Payment System

This module provides payment processing capabilities for the AI Generations feature, allowing users to purchase generation credits and AI tokens.

## Features

- **Credit Purchase**: Users can buy generation credits to use for image generation
- **Token Purchase**: Users can buy AI tokens for other AI-related features
- **One-Time Shop Payment**: Shops can make one-time payments to unlock features
- **FlexPay Integration**: Process payments through the FlexPay payment gateway
- **Webhook Handling**: Process payment confirmations from the payment provider
- **Balance Checking**: Users can check their remaining credits and tokens

## Endpoints

### Create Payment

```
POST /ai-generations/payment
```

Request Body:
```json
{
  "amount": 10,
  "phoneNumber": "243123456789",
  "type": "credit_purchase",
  "currency": "USD",
  "shopId": "optional-shop-id"
}
```

### Check Payment Status

```
GET /ai-generations/payment/status/:paymentId
```

### Check User Balance

```
GET /ai-generations/payment/balance
```

### Webhook Callback

```
POST /ai-generations/payment/webhook
```

Request Body (from payment provider):
```json
{
  "reference": "payment-id",
  "status": "0",
  "bodyMetadata": { }
}
```

## Payment Types

- `credit_purchase`: For buying generation credits
- `token_purchase`: For buying AI tokens
- `one_time_shop`: For one-time shop payments

## Setup Requirements

1. Configure environment variables for FlexPay:
```
FLEX_PAY_API_KEY=your_api_key
FLEX_PAY_WEBHOOK_URL=your_webhook_url
FLEX_PAY_MERCHANT=your_merchant_id
```

## Credits and Tokens

- Credits are used for AI image generation (1 credit per generation)
- Tokens are used for other AI features (varies by feature)
- Pricing: 
  - $1 = 10 generation credits
  - $1 = 100 AI tokens 