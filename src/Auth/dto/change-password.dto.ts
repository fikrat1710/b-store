import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Elektron pochta' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongPassword123', description: 'Joriy parol' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewStrongPassword456', description: 'Yangi parol (kamida 6 belgi)' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}