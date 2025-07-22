import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsArray,
  ValidateNested,
  IsMongoId,
  IsObject,
  IsBoolean, 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductVariantDto } from './product-variant.dto';
import { ApiProperty } from '@nestjs/swagger'; 

export class CreateProductDto { 
  @ApiProperty({ description: 'Mahsulot nomi', example: 'Gaming Kompyuter', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Mahsulot nomi bo\'sh bo\'lmasligi kerak.' })
  name: string;

  @ApiProperty({ description: 'Kompaniya nomi', example: 'Dell', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Kompaniya nomi bo\'sh bo\'lmasligi kerak.' })
  company: string;

  @ApiProperty({ description: 'Model nomi', example: 'Alienware R15', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Model nomi bo\'sh bo\'lmasligi kerak.' })
  productModel: string;

  @ApiProperty({ description: 'Ishlab chiqarilgan yil', example: 2024, required: true })
  @IsNumber()
  @Min(1900, { message: 'Ishlab chiqarilgan yil 1900 yildan kichik bo\'lmasligi kerak.' })
  @Max(new Date().getFullYear() + 1, { message: 'Ishlab chiqarilgan yil kelajakdagi yil bo\'lmasligi kerak.' }) 
  year: number;

  @ApiProperty({ description: 'Mahsulotning asosiy narxi', example: 2500, required: true })
  @IsNumber()
  @Min(0, { message: 'Asosiy narx manfiy bo\'lmasligi kerak.' })
  basePrice: number;

  @ApiProperty({ description: 'Mahsulot tavsifi', example: 'Yuqori unumdorlikdagi o\'yin kompyuteri', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Kategoriya IDsi', example: '60c72b2f9b1d4c001f8e1234', required: true })
  @IsMongoId({ message: 'Kategoriya IDsi noto\'g\'ri formatda.' })
  @IsNotEmpty({ message: 'Kategoriya IDsi bo\'sh bo\'lmasligi kerak.' })
  category: string;

  @ApiProperty({ type: [String], description: 'Mahsulot rasmlari URL manzillari', example: ['http://example.com/img1.jpg', 'http://example.com/img2.jpg'], required: false })
  @IsArray()
  @IsString({ each: true, message: 'Har bir rasm URLi matn bo\'lishi kerak.' })
  @IsOptional()
  images?: string[];

  @ApiProperty({ type: [ProductVariantDto], description: 'Mahsulot variantlari ro\'yxati', required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' }, description: 'Texnik xususiyatlar obyekti', example: { processor: 'Intel i9', ram: '32GB' } })
  @IsObject({ message: 'Texnik xususiyatlar obyekt shaklida bo\'lishi kerak.' })
  @IsOptional()
  technical_specs?: Record<string, string>;

  @ApiProperty({ description: 'Bu yangi kelgan mahsulotmi?', example: true, required: false, default: false })
  @IsBoolean({ message: 'isNewArrival mantiqiy qiymat bo\'lishi kerak.' })
  @IsOptional()
  isNewArrival?: boolean;

  @ApiProperty({ description: 'Bu eng ko\'p sotilgan mahsulotmi?', example: false, required: false, default: false })
  @IsBoolean({ message: 'isBestSeller mantiqiy qiymat bo\'lishi kerak.' })
  @IsOptional()
  isBestSeller?: boolean;

  @ApiProperty({ description: 'Bu tanlangan (featured) mahsulotmi?', example: true, required: false, default: false })
  @IsBoolean({ message: 'isFeatured mantiqiy qiymat bo\'lishi kerak.' })
  @IsOptional()
  isFeatured?: boolean;
}