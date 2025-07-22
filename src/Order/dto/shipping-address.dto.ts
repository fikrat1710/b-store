import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Ko\'cha bo\'sh bo\'lmasligi kerak.' })
  @MaxLength(100, { message: 'Ko\'cha maksimal 100 belgidan iborat bo\'lishi kerak.' })
  street: string;

  @IsString()
  @IsNotEmpty({ message: 'Shahar bo\'sh bo\'lmasligi kerak.' })
  @MaxLength(50, { message: 'Shahar nomi maksimal 50 belgidan iborat bo\'lishi kerak.' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'Viloyat bo\'sh bo\'lmasligi kerak.' })
  @MaxLength(50, { message: 'Viloyat nomi maksimal 50 belgidan iborat bo\'lishi kerak.' })
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'Pochta indeksi bo\'sh bo\'lmasligi kerak.' })
  @MaxLength(20, { message: 'Pochta indeksi maksimal 20 belgidan iborat bo\'lishi kerak.' })
  zipCode: string;

  @IsString()
  @IsNotEmpty({ message: 'Davlat bo\'sh bo\'lmasligi kerak.' })
  @MaxLength(50, { message: 'Davlat nomi maksimal 50 belgidan iborat bo\'lishi kerak.' })
  country: string;
}