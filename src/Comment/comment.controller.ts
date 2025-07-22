import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../Auth/guards/auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Role } from '../Auth/enums/role-enum';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Yangi kommentariya yaratish' })
  @ApiResponse({ status: 201, description: 'Kommentariya muvaffaqiyatli yaratildi.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz so\'rov ma\'lumotlari.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi.' })
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req: Request) {
    const userId = (req.user as any)._id || (req.user as any).id;
    if (!userId) {
      throw new BadRequestException('Foydalanuvchi IDsi topilmadi. Token to`g`ri konfiguratsiyalanmagan.');
    }
    return this.commentService.create(userId.toString(), createCommentDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Barcha kommentariyalarni olish' })
  @ApiResponse({ status: 200, description: 'Kommentariyalar ro\'yxati.' })
  async findAll() {
    return this.commentService.findAll();
  }

  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mahsulot IDsi bo\'yicha kommentariyalarni olish' })
  @ApiResponse({ status: 200, description: 'Mahsulotga tegishli kommentariyalar ro\'yxati.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz mahsulot ID formati.' })
  async findByProduct(@Param('productId') productId: string) {
    return this.commentService.findByProduct(productId);
  }

  @Get('user-comments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Joriy foydalanuvchi tomonidan yozilgan kommentariyalarni olish' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchining kommentariyalari ro\'yxati.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  async findByUser(@Req() req: Request) {
    const userId = (req.user as any)._id || (req.user as any).id;
    if (!userId) {
      throw new BadRequestException('Foydalanuvchi IDsi topilmadi. Token to`g`ri konfiguratsiyalanmagan.');
    }
    return this.commentService.findByUser(userId.toString());
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ID bo\'yicha bitta kommentariyani olish' })
  @ApiResponse({ status: 200, description: 'Kommentariya hujjati.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz kommentariya ID formati.' })
  @ApiResponse({ status: 404, description: 'Kommentariya topilmadi.' })
  async findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Kommentariyani yangilash (faqat egasi)' })
  @ApiResponse({ status: 200, description: 'Kommentariya muvaffaqiyatli yangilandi.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz so\'rov ma\'lumotlari yoki ID formati.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  @ApiResponse({ status: 403, description: 'Ushbu kommentariyani yangilashga ruxsat yo\'q.' })
  @ApiResponse({ status: 404, description: 'Kommentariya topilmadi.' })
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Req() req: Request) {
    const userId = (req.user as any)._id || (req.user as any).id;
    if (!userId) {
      throw new BadRequestException('Foydalanuvchi IDsi topilmadi.');
    }
    return this.commentService.update(id, userId.toString(), updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Kommentariyani o\'chirish (egasi yoki admin/superadmin)' })
  @ApiResponse({ status: 204, description: 'Kommentariya muvaffaqiyatli o\'chirildi.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  @ApiResponse({ status: 403, description: 'Ushbu kommentariyani o\'chirishga ruxsat yo\'q.' })
  @ApiResponse({ status: 404, description: 'Kommentariya topilmadi.' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any)._id || (req.user as any).id;
    const userRoles = (req.user as any).roles || [];
    const isAdmin = userRoles.includes(Role.Admin) || userRoles.includes(Role.SuperAdmin);

    if (!userId) {
      throw new BadRequestException('Foydalanuvchi IDsi topilmadi.');
    }
    await this.commentService.remove(id, userId.toString(), isAdmin);
  }
}