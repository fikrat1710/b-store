import { IsEmail, IsString, Length, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Elektron pochta' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: 'OTP kodi (6 ta raqam yoki harf)' })
  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  otp: string;
}