import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Elektron pochta' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}