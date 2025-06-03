/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';
import { ShopService } from 'src/shop/shop.service';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  private readonly oauth2Client: OAuth2Client;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly shopService: ShopService,
    private readonly configService: ConfigService,
  ) {
    this.oauth2Client = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI'),
    );
  }

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async me(userId: string) {
    const user = await this.userService.findById(userId);
    return user;
  }

  async signup(data: { email: string; password: string; name?: string }) {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.userService.create({ ...data, password: hashed });
    const shop = await this.shopService.create({
      name: data.name || '',
      ownerId: user.id,
    });
    return { user, shop };
  }

  async googleLogin(googleId: string, email: string, name?: string) {
    let user = await this.userService.findByEmail(email);
    if (!user) {
      user = await this.userService.create({ email, name, googleId });
    }
    return this.login(user);
  }

  async getGoogleProfile(code: string) {
    const res = await this.oauth2Client.getToken(code);
    const token = res.tokens.access_token;
    const userInfo = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return userInfo.data;
  }

  async findOrCreateGoogleUser(profile: any) {
    let user = await this.userService.findByEmail(profile.email);
    if (!user) {
      user = await this.userService.create({
        email: profile.email,
        name: profile.name,
        googleId: profile.sub,
      });

      await this.shopService.create({
        name: profile.name,
        ownerId: user.id,
      });
    }
    return user;
  }
}
