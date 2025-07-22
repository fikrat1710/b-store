import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileDocument = File & Document;

@Schema({ timestamps: true })
export class File {
  @Prop({ required: true }) filename: string;
  @Prop({ required: true }) originalname: string;
  @Prop({ required: true }) mimetype: string;
  @Prop({ required: true }) path: string;
  @Prop({ required: true }) size: number;
  @Prop({ type: Types.ObjectId, ref: 'User', required: false }) uploadedBy?: Types.ObjectId;
  @Prop({ default: true }) isPublic: boolean;
  @Prop() description?: string;
}
export const FileSchema = SchemaFactory.createForClass(File);