import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { CreditType } from '../guards/check-credit.guard';

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Deduct credits from a user's account
   * @param userId The user ID
   * @param amount The amount of credits to deduct
   * @param creditType The type of credits to deduct (generationCredits or aiTokens)
   * @returns The updated user
   */
  async deductCredits(
    userId: string,
    amount: number,
    creditType: CreditType = CreditType.GENERATION_CREDITS,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user[creditType] < amount) {
      throw new Error(
        `Not enough ${creditType}. Required: ${amount}, Available: ${user[creditType]}`,
      );
    }

    // Update the user's credits
    const updateData = {};
    updateData[creditType] = user[creditType] - amount;

    await this.userRepository.update(userId, updateData);

    // Return the updated user
    return {
      ...user,
      [creditType]: user[creditType] - amount,
    };
  }

  /**
   * Add credits to a user's account
   * @param userId The user ID
   * @param amount The amount of credits to add
   * @param creditType The type of credits to add (generationCredits or aiTokens)
   * @returns The updated user
   */
  async addCredits(
    userId: string,
    amount: number,
    creditType: CreditType = CreditType.GENERATION_CREDITS,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update the user's credits
    const updateData = {};
    updateData[creditType] = user[creditType] + amount;

    await this.userRepository.update(userId, updateData);

    // Return the updated user
    return {
      ...user,
      [creditType]: user[creditType] + amount,
    };
  }

  /**
   * Get a user's current credit balance
   * @param userId The user ID
   * @returns The user's credit balance
   */
  async getCreditBalance(
    userId: string,
  ): Promise<{ generationCredits: number; aiTokens: number }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      generationCredits: user.generationCredits,
      aiTokens: user.aiTokens,
    };
  }
} 