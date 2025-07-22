import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProductDocument } from '../../Product/schemas/product.schema';
import { UserDocument } from '../../User/schemas/user.schema';

@Schema()
export class ShippingAddress {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true })
  country: string;
}
export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema()
export class PaymentInfo {
  @Prop({ required: true })
  method: string;

  @Prop({ required: true, default: false })
  isPaid: boolean;

  @Prop()
  transactionId?: string;
}
export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);

@Schema()
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  image: string;

  @Prop({ type: Object, required: true })
  selectedVariant: {
    name: string;
    color: string;
    size?: string;
    material?: string;
  };
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  orderItems: OrderItem[];

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ type: PaymentInfoSchema, required: true })
  paymentInfo: PaymentInfo;

  @Prop({ required: true, default: 0 })
  itemsPrice: number;

  @Prop({ required: true, default: 0 })
  shippingPrice: number;

  @Prop({ required: true, default: 0 })
  taxPrice: number;

  @Prop({ required: true, default: 0 })
  totalPrice: number;

  @Prop({
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Date, default: null })
  deliveredAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
export type OrderDocument = Order & Document;