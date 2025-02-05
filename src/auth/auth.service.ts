import { Injectable } from '@nestjs/common';
import { SignUpInput } from './dto/signup-input';
import { UpdateAuthInput } from './dto/update-auth.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { SignResponse } from './dto/sign-response';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(signUpInput: SignUpInput): Promise<SignResponse> {
    const hashedPassword = await argon.hash(signUpInput.password);
    const user = await this.prisma.user.create({
      data: {
        userName: signUpInput.userName,
        hashedPassword,
        email: signUpInput.email,
      },
    });

    const { accessToken, refreshToken } = await this.createTokens(
      user.id,
      user.email,
    );
    await this.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthInput: UpdateAuthInput) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async createTokens(userId: number, email: string) {
    const accessToken = this.jwtService.sign(
      {
        userId,
        email,
      },
      {
        expiresIn: '10s',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      },
    );
    const refreshToken = this.jwtService.sign(
      {
        userId,
        email,
        accessToken,
      },
      {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      },
    );
    return {
      accessToken,
      refreshToken,
    };
  }
  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await argon.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }
}
