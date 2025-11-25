import { DevicePlatform } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class DeviceInfoDto {
  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsEnum(DevicePlatform, { message: 'platform must be IOS, ANDROID, or WEB' })
  platform?: DevicePlatform;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  idleTimeoutSeconds?: number;
}

export class SetPinDto {
  @IsUUID()
  deviceRecordId: string;

  @IsOptional()
  @Matches(/^\d{4,6}$/, { message: 'PIN must be 4-6 digits' })
  pin?: string;

  @IsOptional()
  @IsBoolean()
  remove?: boolean;

  @IsOptional()
  @IsString()
  encryptedKeyBlob?: string;
}

export class SetBiometricDto {
  @IsUUID()
  deviceRecordId: string;

  @IsOptional()
  @IsString()
  biometricToken?: string;

  @IsOptional()
  @IsBoolean()
  remove?: boolean;

  @IsOptional()
  @IsString()
  encryptedKeyBlob?: string;
}

export enum DeviceUnlockMethod {
  PIN = 'PIN',
  BIOMETRIC = 'BIOMETRIC',
}

export class DeviceUnlockDto {
  @IsUUID()
  deviceRecordId: string;

  @IsEnum(DeviceUnlockMethod)
  method: DeviceUnlockMethod;

  @IsOptional()
  @Matches(/^\d{4,6}$/, { message: 'PIN must be 4-6 digits' })
  pin?: string;

  @IsOptional()
  @IsString()
  biometricToken?: string;

  @IsOptional()
  @IsString()
  deviceChallenge?: string;
}

