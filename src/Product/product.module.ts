import { Module, forwardRef } from '@nestjs/common'; 
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { UserModule } from '../User/user.module'

import { CategoryModule } from '../Category/category.module';
import { AuthModule } from '../Auth/auth.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CategoryModule, 
    forwardRef(() => AuthModule),
     forwardRef(() => UserModule), 
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], 
})
export class ProductModule {}