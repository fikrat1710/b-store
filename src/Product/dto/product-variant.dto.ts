import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; 

export class ProductVariantDto {
  @ApiProperty({ description: 'Variant nomi (masalan, "Standart")', example: 'Standart', required: true })
  @IsString({ message: 'Variant nomi satr bo\'lishi kerak.' })
  @IsNotEmpty({ message: 'Variant nomi bo\'sh bo\'lmasligi kerak.' })
  name: string;

  @ApiProperty({ description: 'Variant rangi', example: 'Qora', required: false })
  @IsString({ message: 'Rang satr bo\'lishi kerak.' })
  @IsOptional()
  color?: string;
  @ApiProperty({ description: 'Variant o\'lchami', example: 'M', required: false })
  @IsString({ message: 'O\'lcham satr bo\'lishi kerak.' })
  @IsOptional()
  size?: string;

  @ApiProperty({ description: 'Variant materiali', example: 'Paxta', required: false })
  @IsString({ message: 'Material satr bo\'lishi kerak.' })
  @IsOptional()
  material?: string;

  @ApiProperty({ description: 'Variant miqdori', example: 50, required: true })
  @IsNumber({}, { message: 'Miqdor son bo\'lishi kerak.' })
  @Min(0, { message: 'Miqdor manfiy bo\'lmasligi kerak.' })
  quantity: number;

  @ApiProperty({ description: 'Asosiy narxga nisbatan narx farqi', example: 10, required: true })
  @IsNumber({}, { message: 'Narx farqi son bo\'lishi kerak.' })
  priceAdjustment: number;

  @ApiProperty({ description: 'Sotilgan miqdor', example: 5, required: false, default: 0 })
  @IsNumber({}, { message: 'Sotilgan miqdor son bo\'lishi kerak.' })
  @Min(0, { message: 'Sotilgan miqdor manfiy bo\'lmasligi kerak.' })
  @IsOptional() 
  soldQuantity?: number;
}