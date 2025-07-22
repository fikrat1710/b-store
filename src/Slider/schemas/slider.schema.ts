import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../../Product/schemas/product.schema';

@Schema({ timestamps: true })
export class Slider extends Document {
  @Prop({ required: true, unique: true })
  image: string;

  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', default: null })
  product?: Types.ObjectId;

  @Prop()
  link?: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const SliderSchema = SchemaFactory.createForClass(Slider);
export type SliderDocument = Slider & Document;