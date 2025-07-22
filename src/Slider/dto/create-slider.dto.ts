import { IsString, IsNotEmpty, IsOptional, IsUrl, IsNumber, Min, IsBoolean, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSliderDto {
  @ApiProperty({
    description: 'Slayder rasmining URL manzili',
    example: 'https://example.com/images/new_product_banner.jpg',
    required: true,
  })
  @IsString({ message: 'Rasm URLi satr bo\'lishi kerak.' })
  @IsNotEmpty({ message: 'Rasm URLi bo\'sh bo\'lmasligi kerak.' })
  @IsUrl({}, { message: 'Rasm URLi to\'g\'ri URL formatida bo\'lishi kerak.' })
  image: string;

  @ApiProperty({
    description: 'Slayder sarlavhasi',
    example: 'Yangi mahsulot keldi!',
    required: false,
  })
  @IsString({ message: 'Sarlavha satr bo\'lishi kerak.' })
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Slayder tavsifi',
    example: 'Eng so\'nggi texnologiya bilan jihozlangan mahsulotlarni kashf eting.',
    required: false,
  })
  @IsString({ message: 'Tavsif satr bo\'lishi kerak.' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Agar slayder ma\'lum bir mahsulotni reklama qilsa, o\'sha mahsulotning IDsi',
    example: '60c72b2f9b1d4c001f8e1234',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsMongoId({ message: 'Mahsulot IDsi noto\'g\'ri formatda bo\'lishi kerak.' })
  product?: string | null;

  @ApiProperty({
    description: 'Slayder bosilganda yo\'naltiriladigan URL (agar "product" berilmagan bo\'lsa)',
    example: 'https://example.com/category/electronics',
    required: false,
    nullable: true
  })
  @IsString({ message: 'Havola satr bo\'lishi kerak.' })
  @IsOptional()
  @IsUrl({}, { message: 'Havola to\'g\'ri URL formatida bo\'lishi kerak.' })
  link?: string | null;

  @ApiProperty({
    description: 'Slayderlarning ko\'rsatilish tartibi (raqam, pastroq qiymat birinchi turadi)',
    example: 1,
    required: false,
    default: 0,
  })
  @IsNumber({}, { message: 'Tartib raqami son bo\'lishi kerak.' })
  @Min(0, { message: 'Tartib raqami 0 dan kichik bo\'lmasligi kerak.' })
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: 'Slayderning faol yoki nofaol holati',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean({ message: 'Faollik holati mantiqiy qiymat bo\'lishi kerak.' })
  @IsOptional()
  isActive?: boolean;
}