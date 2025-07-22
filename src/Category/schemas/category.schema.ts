import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductDocument } from '../../Product/schemas/product.schema'; 

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false })
  description?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.virtual('products', {
  ref: 'Product', 
  localField: '_id', 
  foreignField: 'category', 
  justOne: false, 
});

CategorySchema.set('toJSON', { virtuals: true });
CategorySchema.set('toObject', { virtuals: true });