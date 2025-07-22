import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProductDocument } from '../../Product/schemas/product.schema'; 
import { UserDocument } from '../../User/schemas/user.schema';    

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true }) 
export class Comment extends Document { 
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; 

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId; 

  @Prop({ required: true })
  text: string;

  @Prop({ type: Number, min: 1, max: 5, default: null })
  rating?: number; 
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
