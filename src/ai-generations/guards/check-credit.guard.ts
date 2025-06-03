import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';

export enum CreditType {
  GENERATION_CREDITS = 'generationCredits',
  AI_TOKENS = 'aiTokens',
}

export const RequireCredits = (minCredits: number, creditType: CreditType) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('minCredits', minCredits, descriptor.value);
    Reflect.defineMetadata('creditType', creditType, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class CheckCreditGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const handler = context.getHandler();
    const minCredits = this.reflector.get<number>('minCredits', handler) || 1;
    const creditType =
      this.reflector.get<CreditType>('creditType', handler) ||
      CreditType.GENERATION_CREDITS;

    // Get the user with credits information
    const userWithCredits = await this.userRepository.findOne({
      where: { id: user.userId },
    });

    if (!userWithCredits) {
      throw new UnauthorizedException('User not found');
    }

    // Check if the user has enough credits
    const availableCredits = userWithCredits[creditType] || 0;

    if (availableCredits < minCredits) {
      throw new ForbiddenException(
        `Not enough ${creditType}. Required: ${minCredits}, Available: ${availableCredits}`,
      );
    }

    // Add credit information to the request for potential use in the route handler
    request.creditInfo = {
      creditType,
      minCredits,
      availableCredits,
    };

    return true;
  }
}
