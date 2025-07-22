import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
  Query,
  DefaultValuePipe, 
  ParseIntPipe,     
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../Auth/guards/auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Role } from '../Auth/enums/role-enum';

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Yangi mahsulot yaratish (faqat adminlar/superadminlar uchun)' })
  @ApiResponse({ status: 201, description: 'Mahsulot muvaffaqiyatli yaratildi.', type: Product })
  @ApiResponse({ status: 400, description: 'Yaroqsiz so\'rov ma\'lumotlari yoki kategoriya/foydalanuvchi topilmadi.' })
  @ApiResponse({ status: 401, description: 'Ruxsat berilmagan.' })
  @ApiResponse({ status: 403, description: 'Taqiqlangan: Rol yetarli emas.' })
  @ApiBearerAuth('accessToken')
  async create(@Body() createProductDto: CreateProductDto, @Req() req): Promise<Product> {
    const userId = req.user._id; 
    return this.productService.create(createProductDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha mahsulotlarni ixtiyoriy filterlar va qidiruv bilan olish' })
  @ApiResponse({ status: 200, description: 'Barcha mahsulotlar ro\'yxati.', type: [Product] })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Mahsulot nomi, kompaniyasi yoki modeli bo\'yicha qidiruv' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Kategoriya IDsi bo\'yicha filter' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimal asosiy narx bo\'yicha filter' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maksimal asosiy narx bo\'yicha filter' })
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ): Promise<Product[]> {
    return this.productService.findAll(search, categoryId, minPrice, maxPrice);
  }

  @Get('new-arrivals')
  @ApiOperation({ summary: 'Yangi kelgan mahsulotlarni olish' })
  @ApiResponse({ status: 200, description: 'Yangi kelgan mahsulotlar ro\'yxati.', type: [Product] })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Qaytariladigan mahsulotlar soni', example: 10 })
  async getNewArrivals(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<Product[]> {
    return this.productService.getNewArrivals(limit);
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Eng ko\'p sotilgan mahsulotlarni olish' })
  @ApiResponse({ status: 200, description: 'Eng ko\'p sotilgan mahsulotlar ro\'yxati.', type: [Product] })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Qaytariladigan mahsulotlar soni', example: 10 })
  async getBestSellers(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<Product[]> {
    return this.productService.getBestSellers(limit);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Tanlangan (Featured) mahsulotlarni olish' })
  @ApiResponse({ status: 200, description: 'Tanlangan mahsulotlar ro\'yxati.', type: [Product] })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Qaytariladigan mahsulotlar soni', example: 10 })
  async getFeaturedProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<Product[]> {
    return this.productService.getFeaturedProducts(limit);
  }


  @Get(':id')
  @ApiOperation({ summary: 'ID bo\'yicha mahsulotni olish' })
  @ApiResponse({ status: 200, description: 'Mahsulot tafsilotlari.', type: Product })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi.' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'ID bo\'yicha mahsulotni yangilash (faqat adminlar/superadminlar uchun)' })
  @ApiResponse({ status: 200, description: 'Mahsulot muvaffaqiyatli yangilandi.', type: Product })
  @ApiResponse({ status: 400, description: 'Yaroqsiz so\'rov ma\'lumotlari yoki ID formati.' })
  @ApiResponse({ status: 401, description: 'Ruxsat berilmagan.' })
  @ApiResponse({ status: 403, description: 'Taqiqlangan: Rol yetarli emas.' })
  @ApiResponse({ status: 404, description: 'Mahsulot yoki kategoriya topilmadi.' })
  @ApiBearerAuth('accessToken')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'ID bo\'yicha mahsulotni o\'chirish (faqat adminlar/superadminlar uchun)' })
  @ApiResponse({ status: 204, description: 'Mahsulot muvaffaqiyatli o\'chirildi.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz ID formati.' })
  @ApiResponse({ status: 401, description: 'Ruxsat berilmagan.' })
  @ApiResponse({ status: 403, description: 'Taqiqlangan: Rol yetarli emas.' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi.' })
  @ApiBearerAuth('accessToken')
  async remove(@Param('id') id: string): Promise<void> {
    await this.productService.remove(id);
  }
}