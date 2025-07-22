import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './Auth/auth.module';
import { UserModule } from './User/user.module';
import { MailModule } from './Mail/mail.module';
import { CategoryModule } from './Category/category.module';
import { ProductModule } from './Product/product.module';
import { LikeModule } from './Like/like.module';
import { CommentModule } from './Comment/comment.module';
import { OrderModule } from './Order/order.module';
import { SliderModule } from './Slider/slider.module';
import { FileModule } from './file/file.module';
import configuration from './Config/configuration';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
    }),
    AuthModule,
    UserModule,
    MailModule,
    CategoryModule,
    ProductModule,
    LikeModule,
    CommentModule,
    OrderModule,
    SliderModule,
    FileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}