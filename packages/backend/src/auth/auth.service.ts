import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from '@myhealthally/shared';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
        patientId: user.patientId,
        providerId: user.providerId,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash: hashedPassword,
        role: registerDto.role,
        clinicId: registerDto.clinicId,
      },
    });

    // If patient, create patient record
    if (registerDto.role === 'PATIENT' && registerDto.clinicId) {
      const patient = await this.prisma.patient.create({
        data: {
          userId: user.id,
          clinicId: registerDto.clinicId,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        },
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { patientId: patient.id },
      });
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
        patientId: user.patientId,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { 
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = tokenRecord.user;
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const expiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const token = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn,
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }
}

