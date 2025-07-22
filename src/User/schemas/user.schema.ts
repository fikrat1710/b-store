import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';


import { ProductDocument } from '../../Product/schemas/product.schema';
import { LikeDocument } from '../../Like/schemas/like.schema';
import { CommentDocument } from '../../Comment/schemas/comment.schema';
import { OrderDocument } from '../../Order/schemas/order.schema';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isVerified: boolean; 
  otp?: string; 
  otpExpires?: Date | null; 
  refreshToken?: string; 
  role: string; 
  comparePassword: (candidatePassword: string) => Promise<boolean>; 

  
  createdProducts?: ProductDocument[]; 
  likes?: LikeDocument[];           
  comments?: CommentDocument[];     
  orders?: OrderDocument[];        
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false }) 
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: null })
  otp: string;

  @Prop({ default: null, type: Date })
  otpExpires: Date | null;

  @Prop({ default: null, select: false }) 
  refreshToken: string;

  @Prop({ default: 'user' }) 
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.virtual('createdProducts', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'created_by',
  justOne: false,
});

UserSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

UserSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

UserSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });