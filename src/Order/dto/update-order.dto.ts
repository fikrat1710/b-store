import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto, OrderStatus } from './create-order.dto';
import { IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator'; 
import { Type } from 'class-transformer';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Noto\'g\'ri buyurtma holati.' })
  status?: OrderStatus;

  @IsOptional()
  @IsBoolean({ message: 'To\'lov holati mantiqiy qiymat bo\'lishi kerak.' })
  'paymentInfo.isPaid'?: boolean;

  @IsOptional()
  @IsDateString(
    {}, 
    { message: 'Yetkazib berish sanasi noto\'g\'ri formatda bo\'lishi kerak (YYYY-MM-DD).' } 
  )
  deliveredAt?: Date;
}