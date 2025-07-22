import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe', description: 'Foydalanuvchi nomi' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Elektron pochta' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongPassword123', description: 'Parol (kamida 6 belgi)' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}