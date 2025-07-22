import { IsMongoId, IsNotEmpty, IsString, IsNumber, Min, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class SelectedVariantDto {
  @IsString()
  @IsNotEmpty({ message: 'Variant nomi bo\'sh bo\'lmasligi kerak.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Rang bo\'sh bo\'lmasligi kerak.' })
  color: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  material?: string;
}

export class OrderItemDto {
  @IsMongoId({ message: 'Mahsulot IDsi noto\'g\'ri formatda.' })
  @IsNotEmpty({ message: 'Mahsulot IDsi bo\'sh bo\'lmasligi kerak.' })
  product: string;

  @IsString()
  @IsNotEmpty({ message: 'Mahsulot nomi bo\'sh bo\'lmasligi kerak.' })
  name: string;

  @IsNumber()
  @Min(1, { message: 'Miqdor kamida 1 bo\'lishi kerak.' })
  quantity: number;

  @IsNumber()
  @Min(0, { message: 'Narx manfiy bo\'lmasligi kerak.' })
  price: number;

  @IsString()
  @IsNotEmpty({ message: 'Rasm URLi bo\'sh bo\'lmasligi kerak.' })
  image: string;

  @IsObject()
  @ValidateNested()
  @Type(() => SelectedVariantDto)
  selectedVariant: SelectedVariantDto;
}