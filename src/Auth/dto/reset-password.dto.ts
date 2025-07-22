import { IsEmail, IsString, MinLength, Length, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Elektron pochta' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '654321', description: 'OTP kodi (6 ta raqam yoki harf)' })
  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ example: 'NewStrongPassword456', description: 'Yangi parol (kamida 6 belgi)' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}