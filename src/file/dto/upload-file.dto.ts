import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsMongoId } from 'class-validator';

export class UploadFileDto {
  @IsString() @IsOptional() @IsNotEmpty({ message: 'Fayl nomi bo\'sh bo\'lmasligi kerak.' })
  filename?: string;

  @IsString() @IsOptional() description?: string;
  @IsBoolean() @IsOptional() isPublic?: boolean;
  @IsMongoId() @IsOptional() uploadedBy?: string;
}