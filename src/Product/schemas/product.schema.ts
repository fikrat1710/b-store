import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CategoryDocument } from '../../Category/schemas/category.schema';
import { UserDocument } from '../../User/schemas/user.schema';
import { LikeDocument } from '../../Like/schemas/like.schema';
import { CommentDocument } from '../../Comment/schemas/comment.schema';


@Schema()
export class ProductVariant {
  @Prop({ required: true })
  name: string; 
  
  @Prop() 
  color?: string; 

  @Prop()
  size?: string; 
  
  @Prop()
  material?: string; 

  @Prop({ required: true, min: 0 })
  quantity: number; 

  @Prop({ required: true, default: 0 })
  priceAdjustment: number; 

  @Prop({ required: true, default: 0, min: 0 })
  soldQuantity: number; 
}
export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);


@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string; 

  @Prop({ required: true })
  company: string; 

  @Prop({ required: true })
  productModel: string; 

  @Prop({ required: true })
  year: number; 

  @Prop({ required: true })
  basePrice: number; 

  @Prop() 
  description?: string; 

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: [String], default: [] }) 
  images: string[];

  @Prop({ type: [ProductVariantSchema], default: [] }) 
  variants: ProductVariant[];

  @Prop({ type: Map, of: String, default: {} }) 
  technical_specs: Map<string, string>; 

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by: Types.ObjectId;

  @Prop({ default: false })
  isNewArrival: boolean; 

  @Prop({ default: false })
  isBestSeller: boolean; 

  @Prop({ default: false })
  isFeatured: boolean; 

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating: number; 
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export type ProductDocument = Product & Document;

ProductSchema.virtual('totalQuantity').get(function (this: ProductDocument): number {
  return this.variants.reduce((total, variant) => total + variant.quantity, 0);
});

ProductSchema.virtual('totalSoldQuantity').get(function (this: ProductDocument): number {
  return this.variants.reduce((total, variant) => total + variant.soldQuantity, 0);
});

ProductSchema.virtual('likesCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'product',
  count: true
});

ProductSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'product',
  count: true
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });