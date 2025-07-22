import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SliderService } from './slider.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { JwtAuthGuard } from '../Auth/guards/auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Role } from '../Auth/enums/role-enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Slider')
@Controller('slider')
export class SliderController {
  constructor(private readonly sliderService: SliderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Yangi slayder yaratish (faqat adminlar uchun)' })
  @ApiResponse({ status: 201, description: 'Slayder muvaffaqiyatli yaratildi.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz so\'rov ma\'lumotlari.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  @ApiResponse({ status: 403, description: 'Ushbu amalga ruxsat yo\'q.' })
  @ApiResponse({ status: 404, description: 'Mahsulot IDsi topilmadi (agar berilgan bo\'lsa).' })
  @ApiBody({
    type: CreateSliderDto,
    examples: {
      aProductSlider: {
        summary: 'Mahsulot bilan bog\'langan slayder yaratish',
        value: {
          image: 'https://example.com/banners/summer_sale.jpg',
          title: 'Yozgi chegirmalar!',
          description: 'Sevimli mahsulotlaringizda 50% gacha chegirma.',
          product: '60c72b2f9b1d4c001f8e1234',
          order: 1,
          isActive: true
        } as CreateSliderDto,
      },
      aCategorySlider: {
        summary: 'Kategoriya sahifasiga yo\'naltiruvchi slayder yaratish',
        value: {
          image: 'https://example.com/banners/new_electronics.jpg',
          title: 'Yangi Elektronika',
          description: 'Eng so\'nggi gadjetlar bilan tanishing.',
          link: 'https://example.com/category/electronics',
          order: 2,
          isActive: true
        } as CreateSliderDto,
      },
      aSimpleSlider: {
        summary: 'Oddiy rasm slayder yaratish',
        value: {
          image: 'https://example.com/banners/welcome.jpg',
          title: 'Bizga Xush Kelibsiz!',
          order: 3,
          isActive: true
        } as CreateSliderDto,
      },
    },
  })
  async create(@Body() createSliderDto: CreateSliderDto) {
    return this.sliderService.create(createSliderDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Barcha slayderlarni olish (faqat adminlar uchun)' })
  @ApiResponse({ status: 200, description: 'Slayderlar ro\'yxati.' })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  async findAll() {
    return this.sliderService.findAll();
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Foydalanuvchilar uchun faol slayderlarni olish' })
  @ApiResponse({ status: 200, description: 'Faol slayderlar ro\'yxati.' })
  async findActive() {
    return this.sliderService.findActive();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ID bo\'yicha bitta slayderni olish (faqat adminlar uchun)' })
  @ApiResponse({ status: 200, description: 'Slayder hujjati.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz slayder ID formati.' })
  @ApiResponse({ status: 404, description: 'Slayder topilmadi.' })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  async findOne(@Param('id') id: string) {
    return this.sliderService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Slayderni yangilash (faqat adminlar uchun)' })
  @ApiResponse({ status: 200, description: 'Slayder muvaffaqiyatli yangilandi.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz so\'rov ma\'lumotlari yoki ID formati.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  @ApiResponse({ status: 403, description: 'Ushbu amalga ruxsat yo\'q.' })
  @ApiResponse({ status: 404, description: 'Slayder topilmadi.' })
  @ApiBody({
    type: UpdateSliderDto,
    examples: {
      updateTitleAndLink: {
        summary: 'Sarlavha va havolani yangilash',
        value: {
          title: 'Yangi yozgi takliflar!',
          link: 'https://example.com/seasonal-offers',
        } as UpdateSliderDto,
      },
      deactivateSlider: {
        summary: 'Slayderni nofaol qilish',
        value: {
          isActive: false,
        } as UpdateSliderDto,
      },
      updateProduct: {
        summary: 'Slayderni boshqa mahsulotga bog\'lash',
        value: {
          product: '60c72b2f9b1d4c001f8e5678',
          link: null,
        } as UpdateSliderDto,
      },
    },
  })
  async update(@Param('id') id: string, @Body() updateSliderDto: UpdateSliderDto) {
    return this.sliderService.update(id, updateSliderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Slayderni o\'chirish (faqat adminlar uchun)' })
  @ApiResponse({ status: 204, description: 'Slayder muvaffaqiyatli o\'chirildi.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiyadan o\'tmagan foydalanuvchi.' })
  @ApiResponse({ status: 403, description: 'Ushbu amalga ruxsat yo\'q.' })
  @ApiResponse({ status: 404, description: 'Slayder topilmadi.' })
  async remove(@Param('id') id: string) {
    await this.sliderService.remove(id);
  }
}