import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UserRole } from '@myhealthally/shared';
import { IsEmail, IsString, MinLength, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  DeviceInfoDto,
  SetPinDto,
  SetBiometricDto,
  DeviceUnlockDto,
} from './dto/device-auth.dto';

class LoginDtoClass implements LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  device?: DeviceInfoDto;
}

class RegisterDtoClass implements RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  clinicId?: string;
  firstName?: string;
  lastName?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDtoClass) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDtoClass) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('devices')
  async getDevices(@Request() req: any) {
    return this.authService.listDevices(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('device/pin')
  async setDevicePin(@Request() req: any, @Body() body: SetPinDto) {
    return this.authService.setDevicePin(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('device/biometric')
  async setDeviceBiometric(@Request() req: any, @Body() body: SetBiometricDto) {
    return this.authService.setDeviceBiometric(req.user.id, body);
  }

  @Post('device/unlock')
  async unlockDevice(@Body() body: DeviceUnlockDto) {
    return this.authService.unlockDevice(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: any, @Body('refreshToken') refreshToken: string) {
    return this.authService.logout(req.user.id, refreshToken);
  }
}
