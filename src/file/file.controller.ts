import { Controller, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { FileUploadService } from './file-upload.service';
import { UploadFileDto } from './dto/upload-file.dto';

@Controller('files')
export class FileController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) 
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async uploadSingleFile(
    @UploadedFile(new ParseFilePipe({ validators: [ /* ... validators ... */ ], fileIsRequired: true }))
    file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ) {
  
    const savedFile = await this.fileUploadService.saveFileInfo(file, uploadFileDto);
    return { message: 'Fayl muvaffaqiyatli yuklandi!', fileInfo: savedFile };
  }
}
