import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { File, FileDocument } from './schema/file.schema';
import { UploadFileDto } from './dto/upload-file.dto';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  async saveFileInfo(file: Express.Multer.File, uploadFileDto: UploadFileDto): Promise<FileDocument> {
  
    const newFile = new this.fileModel({ /* ... */ });
    return await newFile.save();
  }

  async deleteFile(id: string): Promise<void> {
    
  }
  private async deleteFileFromDisk(filePath: string): Promise<void> { /* ... */ }
}