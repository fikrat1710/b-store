import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../Auth/guards/auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Role } from '../Auth/enums/role-enum';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Yangi buyurtma yaratish' })
  @ApiResponse({ status: 201, description: 'Buyurtma muvaffaqiyatli yaratildi.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz so\'rov ma\'lumotlari yoki zaxira etarli emas.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi.' })
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const userId = (req.user as any)._id || (req.user as any).id;
    if (!userId) {
      throw new BadRequestException('Foydalanuvchi IDsi topilmadi. Token to`g`ri konfiguratsiyalanmagan.');
    }
    return this.orderService.create(userId.toString(), createOrderDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin) 
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Barcha buyurtmalarni olish (faqat adminlar uchun)' })
  @ApiResponse({ status: 200, description: 'Buyurtmalar ro\'yxati.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  @ApiResponse({ status: 403, description: 'Ushbu amalga ruxsat yo\'q.' })
  async findAll() {
    return this.orderService.findAll();
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Joriy foydalanuvchining buyurtmalarini olish' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchining buyurtmalari ro\'yxati.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  async findMyOrders(@Req() req: Request) {
    const userId = (req.user as any)._id || (req.user as any).id;
    if (!userId) {
      throw new BadRequestException('Foydalanuvchi IDsi topilmadi.');
    }
    return this.orderService.findMyOrders(userId.toString());
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'ID bo\'yicha bitta buyurtmani olish (egasi yoki admin)' })
  @ApiResponse({ status: 200, description: 'Buyurtma hujjati.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz buyurtma ID formati.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  @ApiResponse({ status: 403, description: 'Ushbu buyurtmaga kirishga ruxsat yo\'q.' })
  @ApiResponse({ status: 404, description: 'Buyurtma topilmadi.' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any)._id || (req.user as any).id;
    const Roles = (req.user as any).roles || [];
    const isAdmin = Roles.includes(Role.Admin) || Roles.includes(Role.SuperAdmin);

    if (!userId) {
      throw new BadRequestException('Foydalanuvchi IDsi topilmadi.');
    }
    return this.orderService.findOne(id, userId.toString(), isAdmin);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin) 
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Buyurtma holatini yangilash (faqat adminlar uchun)' })
  @ApiResponse({ status: 200, description: 'Buyurtma holati muvaffaqiyatli yangilandi.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz so\'rov ma\'lumotlari yoki ID formati.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  @ApiResponse({ status: 403, description: 'Ushbu amalga ruxsat yo\'q.' })
  @ApiResponse({ status: 404, description: 'Buyurtma topilmadi.' })
  async updateStatus(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.updateStatus(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin) 
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Buyurtmani o\'chirish (faqat adminlar uchun)' })
  @ApiResponse({ status: 204, description: 'Buyurtma muvaffaqiyatli o\'chirildi.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  @ApiResponse({ status: 403, description: 'Ushbu amalga ruxsat yo\'q.' })
  @ApiResponse({ status: 404, description: 'Buyurtma topilmadi.' })
  async remove(@Param('id') id: string) {
    await this.orderService.remove(id);
  }
}