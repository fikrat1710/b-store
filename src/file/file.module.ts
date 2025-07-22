import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileController } from './file.controller';
import { FileUploadService } from './file-upload.service';
import { File, FileSchema } from './schema/file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [FileController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileModule {}