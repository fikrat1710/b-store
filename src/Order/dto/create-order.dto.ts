import {
  IsMongoId,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
  IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingAddressDto } from './shipping-address.dto';
import { PaymentInfoDto } from './payment-info.dto';
import { OrderItemDto } from './order-item.dto';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty({ message: 'Buyurtma mahsulotlari bo\'sh bo\'lmasligi kerak.' })
  orderItems: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ValidateNested()
  @Type(() => PaymentInfoDto)
  paymentInfo: PaymentInfoDto;

  @IsNumber()
  @Min(0, { message: 'Mahsulotlar narxi manfiy bo\'lmasligi kerak.' })
  itemsPrice: number;

  @IsNumber()
  @Min(0, { message: 'Yetkazib berish narxi manfiy bo\'lmasligi kerak.' })
  shippingPrice: number;

  @IsNumber()
  @Min(0, { message: 'Soliq narxi manfiy bo\'lmasligi kerak.' })
  taxPrice: number;

  @IsNumber()
  @Min(0, { message: 'Jami narx manfiy bo\'lmasligi kerak.' })
  totalPrice: number;

  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Noto\'g\'ri buyurtma holati.' })
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Date)
  deliveredAt?: Date;
}