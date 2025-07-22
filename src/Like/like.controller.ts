import { Controller, Post, Body, Param, Delete, Get, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { JwtAuthGuard } from '../Auth/guards/auth.guard'; 
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

import { Like } from './schemas/like.schema';
import { Product } from '../Product/schemas/product.schema';

@ApiTags('Like')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Mahsulotga like bosish' })
  @ApiResponse({ status: 201, description: 'Like muvaffaqiyatli yaratildi.', type: Like })
  @ApiResponse({ status: 401, description: 'Unauthorized: Autentifikatsiya talab qilinadi.' })
  @ApiResponse({ status: 404, description: 'Not Found: Mahsulot topilmadi.' })
  @ApiResponse({ status: 409, description: 'Conflict: Foydalanuvchi bu mahsulotga allaqachon like bosgan.' })
  async create(@Body() createLikeDto: CreateLikeDto, @Req() req: Request) {
   
    const userId = (req.user as any)._id || (req.user as any).id;
    console.log(`[LikeController] create method: userId from req.user: ${userId}`); 
    if (!userId) {
      throw new Error('Foydalanuvchi IDsi topilmadi. Token to`g`ri konfiguratsiyalanmagan.');
    }
    return this.likeService.create(userId.toString(), createLikeDto.product);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Mahsulotdagi likeni o\'chirish' })
  @ApiResponse({ status: 204, description: 'Like muvaffaqiyatli o\'chirildi.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Autentifikatsiya talab qilinadi.' })
  @ApiResponse({ status: 404, description: 'Not Found: Like topilmadi yoki o\'chirishga ruxsat yo\'q.' })
  async remove(@Param('productId') productId: string, @Req() req: Request) {
    const userId = (req.user as any)._id || (req.user as any).id;
    console.log(`[LikeController] remove method: userId from req.user: ${userId}`); 
    if (!userId) {
      throw new Error('Foydalanuvchi IDsi topilmadi.');
    }
    await this.likeService.remove(userId.toString(), productId); 
  }

  @Get(':productId/count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mahsulotning like sonini olish' })
  @ApiResponse({ status: 200, description: 'Mahsulotning like soni.', type: Object })
  @ApiResponse({ status: 400, description: 'Bad Request: Noto\'g\'ri mahsulot ID formati.' })
  async getLikesCountByProductId(@Param('productId') productId: string) {
    return this.likeService.getLikesCountByProductId(productId);
  }

  @Get('user-likes')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Joriy foydalanuvchi like bosgan barcha mahsulotlarni olish' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi like bosgan mahsulotlar ro\'yxati.', type: [Product] })
  @ApiResponse({ status: 401, description: 'Unauthorized: Autentifikatsiya talab qilinadi.' })
  async getUserLikedProducts(@Req() req: Request) {

    const userId = (req.user as any)._id || (req.user as any).id;
    console.log(`[LikeController] getUserLikedProducts method: userId from req.user: ${userId}`); 
    if (!userId) {
      throw new Error('Foydalanuvchi IDsi topilmadi. Avtorizatsiyadan o\'ting.');
    }
    return this.likeService.getUserLikedProducts(userId.toString()); 
  }

  @Get(':productId/is-liked')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Foydalanuvchi mahsulotga like bosganmi yo\'qmi tekshirish' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi like bosganligi holati.', type: Object })
  @ApiResponse({ status: 401, description: 'Unauthorized: Autentifikatsiya talab qilinadi.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Noto\'g\'ri mahsulot ID formati.' })
  async checkIfLiked(@Param('productId') productId: string, @Req() req: Request) {
    const userId = (req.user as any)._id || (req.user as any).id;
    console.log(`[LikeController] checkIfLiked method: userId from req.user: ${userId}`);
    if (!userId) {
      throw new Error('Foydalanuvchi IDsi topilmadi.');
    }
    const isLiked = await this.likeService.isProductLikedByUser(userId.toString(), productId); 
    return { isLiked };
  }
}