import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, ValidateNested, IsArray, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductVariantDto } from './product-variant.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({ type: [ProductVariantDto], description: 'Mahsulot variantlari ro\'yxati (yangilash uchun)', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants?: ProductVariantDto[];

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' }, description: 'Texnik xususiyatlar obyekti (yangilash uchun)', example: { processor: 'Intel i7', ram: '16GB' } })
  @IsObject({ message: 'Texnik xususiyatlar obyekt shaklida bo\'lishi kerak.' })
  @IsOptional()
  technical_specs?: Record<string, string>;

  @ApiProperty({ description: 'Bu yangi kelgan mahsulotmi?', example: true, required: false })
  @IsBoolean({ message: 'isNewArrival mantiqiy qiymat bo\'lishi kerak.' })
  @IsOptional()
  isNewArrival?: boolean;

  @ApiProperty({ description: 'Bu eng ko\'p sotilgan mahsulotmi?', example: false, required: false })
  @IsBoolean({ message: 'isBestSeller mantiqiy qiymat bo\'lishi kerak.' })
  @IsOptional()
  isBestSeller?: boolean;

  @ApiProperty({ description: 'Bu tanlangan (featured) mahsulotmi?', example: true, required: false })
  @IsBoolean({ message: 'isFeatured mantiqiy qiymat bo\'lishi kerak.' })
  @IsOptional()
  isFeatured?: boolean;
}