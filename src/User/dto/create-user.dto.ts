import { IsString, IsEmail, MinLength, MaxLength, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Foydalanuvchining unikal nomi', example: 'john_doe' })
  @IsString({ message: 'Username string bo‘lishi kerak.' })
  @MinLength(3, { message: 'Username kamida 3 ta belgidan iborat bo‘lishi kerak.' })
  @MaxLength(30, { message: 'Username ko‘pi bilan 30 ta belgidan iborat bo‘lishi kerak.' })
  username: string;

  @ApiProperty({ description: 'Foydalanuvchining elektron pochta manzili', example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Yaroqli elektron pochta manzili bo‘lishi kerak.' })
  email: string;

  @ApiProperty({ description: 'Foydalanuvchi paroli', example: 'StrongP@ssw0rd' })
  @IsString({ message: 'Parol string bo‘lishi kerak.' })
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak.' })
  password: string;

  @ApiProperty({ description: 'Foydalanuvchi tasdiqlanganmi', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: 'isVerified boolean bo‘lishi kerak.' })
  isVerified?: boolean;

  @ApiProperty({ description: 'Foydalanuvchining roli', example: 'user', required: false })
  @IsOptional()
  @IsString({ message: 'Rol string bo‘lishi kerak.' })
  role?: string;
}