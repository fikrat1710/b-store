import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional, MinLength, MaxLength, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'Foydalanuvchining yangi unikal nomi', example: 'jane_doe', required: false })
  @IsOptional()
  @IsString({ message: 'Username string bo‘lishi kerak.' })
  @MinLength(3, { message: 'Username kamida 3 ta belgidan iborat bo‘lishi kerak.' })
  @MaxLength(30, { message: 'Username ko‘pi bilan 30 ta belgidan iborat bo‘lishi kerak.' })
  username?: string;

  @ApiProperty({ description: 'Foydalanuvchining yangi elektron pochta manzili', example: 'jane.doe@example.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Yaroqli elektron pochta manzili bo‘lishi kerak.' })
  email?: string;

  @ApiProperty({ description: 'Foydalanuvchining yangi paroli', example: 'NewStrongP@ssw0rd', required: false })
  @IsOptional()
  @IsString({ message: 'Parol string bo‘lishi kerak.' })
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak.' })
  password?: string;

  @ApiProperty({ description: 'Foydalanuvchi tasdiqlanganmi', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'isVerified boolean bo‘lishi kerak.' })
  isVerified?: boolean;

  @ApiProperty({ description: 'Foydalanuvchining yangi roli', example: 'admin', required: false })
  @IsOptional()
  @IsString({ message: 'Rol string bo‘lishi kerak.' })
  role?: string;

  @ApiProperty({ description: 'Foydalanuvchining OTP kodi', example: 'ABCDEF', required: false })
  @IsOptional()
  @IsString({ message: 'OTP string bo‘lishi kerak.' })
  otp?: string;

  @ApiProperty({ description: 'OTP ning amal qilish muddati', example: '2025-07-15T12:00:00Z', required: false })
  @IsOptional()
  otpExpires?: Date | null;

  @ApiProperty({ description: 'Yangilash tokeni', example: 'someRefreshTokenString', required: false })
  @IsOptional()
  @IsString({ message: 'Refresh token string bo‘lishi kerak.' })
  refreshToken?: string;
}