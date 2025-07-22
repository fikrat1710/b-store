import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SliderService } from './slider.service';
import { SliderController } from './slider.controller';
import { Slider, SliderSchema } from './schemas/slider.schema';
import { ProductModule } from '../Product/product.module';
import { Product, ProductSchema } from '../Product/schemas/product.schema';   

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Slider.name, schema: SliderSchema },
      { name: Product.name, schema: ProductSchema }, 
    ]),
    ProductModule,
  ],
  providers: [SliderService],
  controllers: [SliderController],
  exports: [SliderService],
})
export class SliderModule {}