import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { ProductModule } from '../Product/product.module';
import { UserModule } from '../User/user.module';
import { User, UserSchema } from '../User/schemas/user.schema'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema }, 
    ]),
    ProductModule,
    UserModule,
  ],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}