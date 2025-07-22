import { IsString, IsNotEmpty, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class PaymentInfoDto {
  @IsString()
  @IsNotEmpty({ message: 'To\'lov usuli bo\'sh bo\'lmasligi kerak.' })
  @MaxLength(50, { message: 'To\'lov usuli maksimal 50 belgidan iborat bo\'lishi kerak.' })
  method: string;

  @IsBoolean({ message: 'To\'lov holati mantiqiy qiymat bo\'lishi kerak.' })
  @IsOptional()
  isPaid?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Tranzaksiya IDsi maksimal 100 belgidan iborat bo\'lishi kerak.' })
  transactionId?: string;
}