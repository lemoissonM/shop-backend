# AI Generations Credit System

This module provides a credit system for controlling access to AI generation features. Users need to have sufficient credits to use the generation features.

## Types of Credits

- **Generation Credits**: Used for image generation features
- **AI Tokens**: Used for other AI features

## Features

- **Credit Check Guard**: Verifies if a user has enough credits before allowing access to a route
- **Credit Service**: Allows for adding, deducting, and checking credit balances
- **RequireCredits Decorator**: Specifies the required credits for a route

## Usage

### Protecting Routes with Credit Guard

```typescript
import { CheckCreditGuard, RequireCredits, CreditType } from './guards/check-credit.guard';

@Post('generate')
@UseGuards(JwtAuthGuard, CheckCreditGuard)
@RequireCredits(1, CreditType.GENERATION_CREDITS) // Requires 1 generation credit
async generateImage(@Body() dto: GenerateDto, @Req() req) {
  // Route is only accessible if the user has at least 1 generation credit
  
  // Deduct credits after successful generation
  await this.creditService.deductCredits(
    req.user.id, 
    1, 
    CreditType.GENERATION_CREDITS
  );
  
  // Generate the image
  return this.aiService.generateImage(dto);
}
```

### Managing Credits

```typescript
import { CreditService } from './services/credit.service';
import { CreditType } from './guards/check-credit.guard';

// Inject the credit service
constructor(private creditService: CreditService) {}

// Deduct credits
await this.creditService.deductCredits(userId, 1, CreditType.GENERATION_CREDITS);

// Add credits
await this.creditService.addCredits(userId, 10, CreditType.GENERATION_CREDITS);

// Check credit balance
const balance = await this.creditService.getCreditBalance(userId);
console.log(`Generation Credits: ${balance.generationCredits}`);
console.log(`AI Tokens: ${balance.aiTokens}`);
```

## Credit Costs

Different features require different amounts of credits:

- Basic image generation: 1 generation credit
- Professional photo: 1 generation credit
- Change hairstyle: 1 generation credit
- Upscale image: 2 generation credits (higher quality costs more)

## Implementation Details

- The `CheckCreditGuard` automatically retrieves the required credits from metadata set by the `RequireCredits` decorator
- Credit information is added to the request object as `req.creditInfo` for use in the route handler
- Failed credit checks result in a `ForbiddenException` with details about the required and available credits 