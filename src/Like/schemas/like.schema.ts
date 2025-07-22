import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProductDocument } from '../../Product/schemas/product.schema'; 
import { UserDocument } from '../../User/schemas/user.schema';    

export type LikeDocument = Like & Document;

@Schema({ timestamps: true }) 
export class Like extends Document { 
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; 

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId; 
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.index({ user: 1, product: 1 }, { unique: true });