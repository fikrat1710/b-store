import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Response } from 'express';
import { JwtAuthGuard, RefreshJwtAuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { UserDocument } from '../User/schemas/user.schema'; 
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Yangi foydalanuvchini ro‘yxatdan o‘tkazish va OTP yuborish' })
  @ApiResponse({ status: 201, description: 'Ro‘yxatdan o‘tish muvaffaqiyatli.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz ma‘lumotlar yoki elektron pochta allaqachon band.' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Elektron pochtani OTP orqali tasdiqlash' })
  @ApiResponse({ status: 200, description: 'Elektron pochta muvaffaqiyatli tasdiqlandi.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz yoki eskirgan OTP.' })
  @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi.' })
  @ApiBody({ type: VerifyOtpDto })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('login')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Foydalanuvchiga kirish va tokenlar olish' })
@ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirish, foydalanuvchi ma‘lumotlari va cookie’lar.' })
@ApiResponse({ status: 401, description: 'Yaroqsiz elektron pochta/parol.' })
@ApiResponse({ status: 403, description: 'Elektron pochta tasdiqlanmagan.' })
@ApiBody({ type: LoginDto })
async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
  const { user, accessToken, refreshToken } = await this.authService.login(loginDto);

  res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3600000 });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 604800000 });

  return { user, accessToken, refreshToken }; 
}

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Foydalanuvchini tizimdan chiqarish' })
  @ApiBearerAuth('accessToken')
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli chiqish.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiya qilinmagan.' })
  async logout(@Res({ passthrough: true }) res: Response, @GetUser() user: UserDocument) { 
    await this.authService.logout(user._id.toString());
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Muvaffaqiyatli chiqdingiz.' };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Parolni unutgan foydalanuvchi uchun OTP yuborish' })
  @ApiResponse({ status: 201, description: 'Parolni tiklash kodi elektron pochtaga yuborildi.' })
  @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi.' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'OTP orqali parolni tiklash' })
  @ApiResponse({ status: 201, description: 'Parol muvaffaqiyatli tiklandi.' })
  @ApiResponse({ status: 400, description: 'Yaroqsiz yoki eskirgan OTP.' })
  @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi.' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Foydalanuvchi parolini o‘zgartirish' })
  @ApiBearerAuth('accessToken')
  @ApiResponse({ status: 201, description: 'Parol muvaffaqiyatli o‘zgartirildi.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiya qilinmagan yoki joriy parol noto‘g‘ri.' })
  @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi.' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }

  @Get('refresh')
  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token orqali yangi access token olish' })
  @ApiBearerAuth('refreshToken')
  @ApiResponse({ status: 200, description: 'Tokenlar yangilandi.' })
  @ApiResponse({ status: 401, description: 'Yaroqsiz refresh token.' })
  async refreshTokens(@GetUser() user: UserDocument, @Res({ passthrough: true }) res: Response) { 
    const { accessToken, refreshToken } = await this.authService.refreshToken(user);
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3600000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 604800000 });
    return { message: 'Tokenlar yangilandi.' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Foydalanuvchi profil ma‘lumotlarini olish' })
  @ApiBearerAuth('accessToken')
  @ApiResponse({ status: 200, description: 'Foydalanuvchi ma‘lumotlari.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiya qilinmagan.' })
  getProfile(@GetUser() user: UserDocument) { 
    return user;
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Faqat adminlar va superadminlar uchun endpoint' })
  @ApiBearerAuth('accessToken')
  @ApiResponse({ status: 200, description: 'Admin ma‘lumotlari.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiya qilinmagan.' })
  @ApiResponse({ status: 403, description: 'Ruxsat yo‘q.' })
  getAdminData() {
    return { message: 'Bu faqat adminlar uchun ma‘lumot.' };
  }

  @Get('superadmin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Faqat superadminlar uchun endpoint' })
  @ApiBearerAuth('accessToken')
  @ApiResponse({ status: 200, description: 'Superadmin ma‘lumotlari.' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiya qilinmagan.' })
  @ApiResponse({ status: 403, description: 'Ruxsat yo‘q.' })
  getSuperAdminData() {
    return { message: 'Bu faqat superadminlar uchun ma‘lumot.' };
  }
}
// hdhjjhs