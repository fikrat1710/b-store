import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';
import { IsOptional, IsString, MaxLength, IsNumber, Min, Max } from 'class-validator';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Izoh matni maksimal 500 belgidan iborat bo\'lishi kerak.' })
  text?: string;

  @IsNumber({}, { message: 'Baho raqam bo\'lishi kerak.' })
  @Min(1, { message: 'Baho 1 dan kam bo\'lmasligi kerak.' })
  @Max(5, { message: 'Baho 5 dan ko\'p bo\'lmasligi kerak.' })
  @IsOptional()
  rating?: number;
}