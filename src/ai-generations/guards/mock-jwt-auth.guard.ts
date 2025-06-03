import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // In a real application, this would validate the JWT token
    // For now, we'll just return true to bypass authentication for testing
    const request = context.switchToHttp().getRequest();
    request.user = { id: 'test-user-id' }; // Mock user data
    return true;
  }
} 