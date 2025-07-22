import { IsMongoId, IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateCommentDto {
  @IsMongoId({ message: 'Mahsulot IDsi noto\'g\'ri formatda.' })
  @IsNotEmpty({ message: 'Mahsulot IDsi bo\'sh bo\'lmasligi kerak.' })
  product: string; 

  @IsString()
  @IsNotEmpty({ message: 'Izoh matni bo\'sh bo\'lmasligi kerak.' })
  @MaxLength(500, { message: 'Izoh matni maksimal 500 belgidan iborat bo\'lishi kerak.' })
  text: string;

  @IsNumber({}, { message: 'Baho raqam bo\'lishi kerak.' })
  @Min(1, { message: 'Baho 1 dan kam bo\'lmasligi kerak.' })
  @Max(5, { message: 'Baho 5 dan ko\'p bo\'lmasligi kerak.' })
  @IsOptional() 
  rating?: number;
}