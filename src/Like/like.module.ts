import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { Like, LikeSchema } from './schemas/like.schema';
import { Product, ProductSchema } from '../Product/schemas/product.schema'; 
import { User, UserSchema } from '../User/schemas/user.schema'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Like.name, schema: LikeSchema },
      { name: Product.name, schema: ProductSchema }, 
      { name: User.name, schema: UserSchema }, 
    ]),
  ],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService], 
})
export class LikeModule {}