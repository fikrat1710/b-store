import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateLikeDto {
  @IsMongoId({ message: 'Mahsulot IDsi noto\'g\'ri formatda.' })
  @IsNotEmpty({ message: 'Mahsulot IDsi bo\'sh bo\'lmasligi kerak.' })
  product: string; 
}