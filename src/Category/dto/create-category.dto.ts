import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Kategoriya nomi bo\'sh bo\'lmasligi kerak.' })
  @MaxLength(50, { message: 'Kategoriya nomi maksimal 50 belgidan iborat bo\'lishi kerak.' })
  name: string;

  @IsString()
  @IsOptional() 
  @MaxLength(255, { message: 'Tavsif maksimal 255 belgidan iborat bo\'lishi kerak.' })
  description?: string;
}