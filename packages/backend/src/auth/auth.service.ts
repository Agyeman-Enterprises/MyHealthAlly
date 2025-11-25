import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from '@myhealthally/shared';
import { DevicePlatform, UserDevice } from '@prisma/client';
import {
  SetPinDto,
  SetBiometricDto,
  DeviceUnlockDto,
  DeviceUnlockMethod,
  DeviceInfoDto,
} from './dto/device-auth.dto';

@Injectable()
export class AuthService {
  private readonly defaultIdleTimeout = 900; // 15 minutes
  private readonly maxIdleTimeout = 3600; // 60 minutes
  private readonly minIdleTimeout = 60; // 1 minute
  private readonly refreshTokenDays: number;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.refreshTokenDays = Number(this.config.get('SESSION_TTL_DAYS') || 30);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const device = await this.upsertDevice(user.id, loginDto.device as Partial<DeviceInfoDto>);
    const tokens = await this.issueSession(user, device);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.buildUserResponse(user),
      device: this.serializeDevice(tokens.device),
      session: this.buildSessionResponse(tokens.session, tokens.device),
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

    const device = await this.upsertDevice(user.id);
    const tokens = await this.issueSession(user, device);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.buildUserResponse(user),
      device: this.serializeDevice(tokens.device),
      session: this.buildSessionResponse(tokens.session, tokens.device),
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const session = await this.prisma.userSession.findFirst({
      where: { sessionToken: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            clinicId: true,
            patientId: true,
            providerId: true,
          },
        },
        device: true,
      },
    });

    if (session) {
      if (session.revokedAt) {
        throw new UnauthorizedException('Session revoked');
      }

      const now = new Date();
      if (session.expiresAt < now) {
        await this.revokeSessionByToken(refreshToken);
        throw new UnauthorizedException('Session expired');
      }

      const idleLimit =
        (session.device?.idleTimeoutSeconds ?? this.defaultIdleTimeout) * 1000;
      if (now.getTime() - session.lastActiveAt.getTime() > idleLimit) {
        await this.revokeSessionByToken(refreshToken);
        throw new UnauthorizedException('Session expired due to inactivity');
      }

      const payload = {
        email: session.user.email,
        sub: session.user.id,
        role: session.user.role,
      };
      const accessToken = this.jwtService.sign(payload);
      const updatedSession = await this.prisma.userSession.update({
        where: { id: session.id },
        data: { lastActiveAt: now },
      });

      return {
        accessToken,
        user: this.buildUserResponse(session.user),
        device: this.serializeDevice(session.device),
        session: this.buildSessionResponse(updatedSession, session.device),
      };
    }

    return this.refreshLegacyToken(refreshToken);
  }

  async listDevices(userId: string) {
    const devices = await this.prisma.userDevice.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        sessions: {
          where: { revokedAt: null, expiresAt: { gt: new Date() } },
          select: {
            id: true,
            lastActiveAt: true,
            expiresAt: true,
          },
          orderBy: { lastActiveAt: 'desc' },
        },
      },
    });

    return devices.map((device) => ({
      ...this.serializeDevice(device),
      sessions: device.sessions,
    }));
  }

  async setDevicePin(userId: string, dto: SetPinDto) {
    const device = await this.ensureDeviceOwnership(userId, dto.deviceRecordId);

    if (dto.remove) {
      const updated = await this.prisma.userDevice.update({
        where: { id: device.id },
        data: { pinEnabled: false, pinHash: null },
      });
      return this.serializeDevice(updated);
    }

    if (!dto.pin) {
      throw new BadRequestException('PIN is required');
    }

    const pinHash = await bcrypt.hash(dto.pin, 12);
    const updated = await this.prisma.userDevice.update({
      where: { id: device.id },
      data: {
        pinEnabled: true,
        pinHash,
        encryptedKeyBlob: dto.encryptedKeyBlob ?? device.encryptedKeyBlob,
      },
    });

    return this.serializeDevice(updated);
  }

  async setDeviceBiometric(userId: string, dto: SetBiometricDto) {
    const device = await this.ensureDeviceOwnership(userId, dto.deviceRecordId);

    if (dto.remove) {
      const updated = await this.prisma.userDevice.update({
        where: { id: device.id },
        data: { biometricEnabled: false, biometricKey: null },
      });
      return this.serializeDevice(updated);
    }

    if (!dto.biometricToken) {
      throw new BadRequestException('Biometric token required');
    }

    const biometricKey = await bcrypt.hash(dto.biometricToken, 12);
    const updated = await this.prisma.userDevice.update({
      where: { id: device.id },
      data: {
        biometricEnabled: true,
        biometricKey,
        encryptedKeyBlob: dto.encryptedKeyBlob ?? device.encryptedKeyBlob,
      },
    });

    return this.serializeDevice(updated);
  }

  async unlockDevice(dto: DeviceUnlockDto) {
    const device = await this.prisma.userDevice.findUnique({
      where: { id: dto.deviceRecordId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            clinicId: true,
            patientId: true,
            providerId: true,
          },
        },
      },
    });

    if (!device || !device.user) {
      throw new UnauthorizedException('Device not recognized');
    }

    if (dto.method === DeviceUnlockMethod.PIN) {
      if (!dto.pin) {
        throw new BadRequestException('PIN is required');
      }
      if (!device.pinEnabled || !device.pinHash) {
        throw new UnauthorizedException('PIN unlock not configured');
      }
      const matches = await bcrypt.compare(dto.pin, device.pinHash);
      if (!matches) {
        throw new UnauthorizedException('Invalid PIN');
      }
    } else {
      if (!dto.biometricToken) {
        throw new BadRequestException('Biometric token required');
      }
      if (!device.biometricEnabled || !device.biometricKey) {
        throw new UnauthorizedException('Biometric unlock not configured');
      }
      const matches = await bcrypt.compare(dto.biometricToken, device.biometricKey);
      if (!matches) {
        throw new UnauthorizedException('Biometric verification failed');
      }
    }

    const tokens = await this.issueSession(device.user, device);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.buildUserResponse(device.user),
      device: this.serializeDevice(tokens.device),
      session: this.buildSessionResponse(tokens.session, tokens.device),
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.userSession.updateMany({
        where: { userId, sessionToken: refreshToken },
        data: { revokedAt: new Date() },
      });
      await this.prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken },
      });
    }

    return { success: true };
  }

  private buildUserResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
      patientId: user.patientId,
      providerId: user.providerId,
    };
  }

  private async upsertDevice(
    userId: string,
    deviceInput?: Partial<DeviceInfoDto>,
  ): Promise<UserDevice> {
    const platform = this.normalizePlatform(deviceInput?.platform);
    const deviceId =
      deviceInput?.deviceId ||
      `${platform.toLowerCase()}-${userId}`;
    const deviceName =
      deviceInput?.deviceName ||
      (platform === DevicePlatform.WEB ? 'Web Browser' : 'Personal Device');
    const idleTimeout = this.normalizeIdleTimeout(deviceInput?.idleTimeoutSeconds);

    return this.prisma.userDevice.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
      update: {
        deviceName,
        platform,
        idleTimeoutSeconds: idleTimeout,
      },
      create: {
        userId,
        deviceId,
        deviceName,
        platform,
        idleTimeoutSeconds: idleTimeout,
      },
    });
  }

  private normalizePlatform(platform?: DevicePlatform | string): DevicePlatform {
    if (!platform) return DevicePlatform.WEB;
    const normalized = typeof platform === 'string' ? platform.toUpperCase() : platform;
    if (normalized === DevicePlatform.IOS || normalized === 'IOS') return DevicePlatform.IOS;
    if (normalized === DevicePlatform.ANDROID || normalized === 'ANDROID') {
      return DevicePlatform.ANDROID;
    }
    return DevicePlatform.WEB;
  }

  private normalizeIdleTimeout(value?: number) {
    if (!value) return this.defaultIdleTimeout;
    return Math.min(this.maxIdleTimeout, Math.max(this.minIdleTimeout, Math.floor(value)));
  }

  private async issueSession(user: any, device: UserDevice) {
    const now = new Date();
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = randomBytes(48).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenDays);

    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        deviceId: device.id,
        sessionToken: refreshToken,
        lastActiveAt: now,
        expiresAt,
      },
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    const updatedDevice = await this.prisma.userDevice.update({
      where: { id: device.id },
      data: { lastUnlockAt: now },
    });

    return {
      accessToken,
      refreshToken,
      session,
      device: updatedDevice,
    };
  }

  private serializeDevice(device?: UserDevice | null) {
    if (!device) return null;
    return {
      id: device.id,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      platform: device.platform,
      biometricEnabled: device.biometricEnabled,
      pinEnabled: device.pinEnabled,
      idleTimeoutSeconds: device.idleTimeoutSeconds,
      lastUnlockAt: device.lastUnlockAt,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    };
  }

  private buildSessionResponse(session: any, device?: UserDevice | null) {
    return {
      id: session.id,
      lastActiveAt: session.lastActiveAt,
      expiresAt: session.expiresAt,
      idleTimeoutSeconds: device?.idleTimeoutSeconds ?? this.defaultIdleTimeout,
    };
  }

  private async ensureDeviceOwnership(userId: string, deviceRecordId: string) {
    const device = await this.prisma.userDevice.findFirst({
      where: { id: deviceRecordId, userId },
    });
    if (!device) {
      throw new UnauthorizedException('Device not found for user');
    }
    return device;
  }

  private async revokeSessionByToken(refreshToken: string) {
    await this.prisma.userSession.updateMany({
      where: { sessionToken: refreshToken },
      data: { revokedAt: new Date() },
    });
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  private async refreshLegacyToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            clinicId: true,
            patientId: true,
            providerId: true,
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

    return {
      accessToken,
      user: this.buildUserResponse(user),
    };
  }
}
