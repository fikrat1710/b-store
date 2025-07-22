import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, NotFoundException } from '@nestjs/common'; // NotFoundException ni qo'shildi
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../Auth/guards/auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { UserDocument } from './schemas/user.schema';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi foydalanuvchi yaratish (faqat Admin/Superadmin)' })
  @ApiResponse({ status: 201, description: 'Foydalanuvchi muvaffaqiyatli yaratildi.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz ma‘lumotlar.' })
  @ApiResponse({ status: 403, description: 'Ruxsat yo‘q.' })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDocument> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha foydalanuvchilarni olish (faqat Admin/Superadmin)' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchilar ro‘yxati.' })
  @ApiResponse({ status: 403, description: 'Ruxsat yo‘q.' })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async findAll(): Promise<UserDocument[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID bo‘yicha foydalanuvchi olish (faqat Admin/Superadmin)' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi ma‘lumotlari.' })
  @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi.' })
  @ApiResponse({ status: 403, description: 'Ruxsat yo‘q.' })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async findOne(@Param('id') id: string): Promise<UserDocument> { 
    const user = await this.userService.findById(id);
    if (!user) { 
      throw new NotFoundException(`Foydalanuvchi topilmadi: ID ${id}`);
    }
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Foydalanuvchini yangilash (faqat Admin/Superadmin)' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi muvaffaqiyatli yangilandi.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz ma‘lumotlar.' })
  @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi.' })
  @ApiResponse({ status: 403, description: 'Ruxsat yo‘q.' })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserDocument> { // Hozircha UserDocument qoldiramiz
    const updatedUser = await this.userService.update(id, updateUserDto);
    if (!updatedUser) { 
      throw new NotFoundException(`Foydalanuvchi topilmadi: ID ${id}`);
    }
    return updatedUser;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Foydalanuvchini o‘chirish (faqat Admin/Superadmin)' })
  @ApiResponse({ status: 204, description: 'Foydalanuvchi muvaffaqiyatli o‘chirildi.' })
  @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi.' })
  @ApiResponse({ status: 403, description: 'Ruxsat yo‘q.' })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async remove(@Param('id') id: string): Promise<void> {

    await this.userService.remove(id);
  }
}