import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../User/user.service';
import { MailService } from '../Mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserDocument } from '../User/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;
  private readonly otpExpiresInMinutes: number;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {
    const jwtSecret = this.configService.get<string>('jwt.secret');
    const jwtRefreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const jwtExpiresIn = this.configService.get<string>('jwt.expiresIn');
    const jwtRefreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn');
    const otpExpiresInMinutes = this.configService.get<number>('otp.expiresInMinutes');

    if (!jwtSecret) throw new Error('JWT_SECRET .env faylida o‘rnatilmagan.');
    if (!jwtRefreshSecret) throw new Error('JWT_REFRESH_SECRET .env faylida o‘rnatilmagan.');
    if (!jwtExpiresIn) throw new Error('JWT expiresIn konfiguratsiyasi o‘rnatilmagan.');
    if (!jwtRefreshExpiresIn) throw new Error('JWT refreshExpiresIn konfiguratsiyasi o‘rnatilmagan.');
    if (!otpExpiresInMinutes) throw new Error('OTP expiresInMinutes konfiguratsiyasi o‘rnatilmagan.');


    this.jwtSecret = jwtSecret;
    this.jwtRefreshSecret = jwtRefreshSecret;
    this.jwtExpiresIn = jwtExpiresIn;
    this.jwtRefreshExpiresIn = jwtRefreshExpiresIn;
    this.otpExpiresInMinutes = otpExpiresInMinutes;
  }

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Bu elektron pochta manzili allaqachon ro‘yxatdan o‘tgan.');
    }

    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    const otpExpires = new Date(Date.now() + this.otpExpiresInMinutes * 60 * 1000);

    await this.userService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      isVerified: false,
      otp: otp,
      otpExpires: otpExpires,
    });

    await this.mailService.sendOtpEmail(registerDto.email, otp, 'Elektron pochta tasdiqlash kodi');

    return { message: 'Ro‘yxatdan o‘tish muvaffaqiyatli. Elektron pochtangizga tasdiqlash kodi yuborildi.' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(verifyOtpDto.email);

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi.');
    }

    if (user.isVerified) {
      throw new BadRequestException('Bu foydalanuvchi allaqachon tasdiqlangan.');
    }

    if (!user.otp || user.otp.toUpperCase() !== verifyOtpDto.otp.toUpperCase() || !user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestException('Yaroqsiz yoki eskirgan OTP.');
    }

    await this.userService.update(user._id.toString(), {
      isVerified: true,
      otp: '',
      otpExpires: null,
    });

    return { message: 'Elektron pochta muvaffaqiyatli tasdiqlandi.' };
  }

  async login(loginDto: LoginDto): Promise<{ user: Partial<UserDocument>; accessToken: string; refreshToken: string }> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Yaroqsiz elektron pochta yoki parol.');
    }

    if (!user.isVerified) {
      throw new ForbiddenException('Iltimos, avval elektron pochtangizni tasdiqlang.');
    }

    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Yaroqsiz elektron pochta yoki parol.');
    }

    const payload = { email: user.email, sub: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn,
    });

    const refreshTokenId = uuidv4();
    const refreshToken = this.jwtService.sign(
      { sub: user._id, jti: refreshTokenId, role: user.role },
      {
        secret: this.jwtRefreshSecret,
        expiresIn: this.jwtRefreshExpiresIn,
      },
    );

    await this.userService.updateRefreshToken(user._id.toString(), refreshTokenId);

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.otp;
    delete userWithoutPassword.otpExpires;
    delete userWithoutPassword.refreshToken;

    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.userService.updateRefreshToken(userId, '');
    return { message: 'Tizimdan chiqish muvaffaqiyatli.' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi.');
    }

    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    const otpExpires = new Date(Date.now() + this.otpExpiresInMinutes * 60 * 1000);

    await this.userService.update(user._id.toString(), {
      otp: otp,
      otpExpires: otpExpires,
    });

    await this.mailService.sendOtpEmail(user.email, otp, 'Parolni tiklash kodi');
    return { message: 'Parolni tiklash kodi elektron pochtangizga yuborildi.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(resetPasswordDto.email);

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi.');
    }

    if (!user.otp || user.otp.toUpperCase() !== resetPasswordDto.otp.toUpperCase() || !user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestException('Yaroqsiz yoki eskirgan OTP.');
    }

    await this.userService.update(user._id.toString(), {
      password: resetPasswordDto.newPassword,
      otp: '',
      otpExpires: null,
    });

    return { message: 'Parol muvaffaqiyatli tiklandi.' };
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(changePasswordDto.email);

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi.');
    }

    const isPasswordValid = await user.comparePassword(changePasswordDto.currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Joriy parol noto‘g‘ri.');
    }

    await this.userService.update(user._id.toString(), {
      password: changePasswordDto.newPassword,
    });

    return { message: 'Parol muvaffaqiyatli o‘zgartirildi.' };
  }

  async refreshToken(user: UserDocument): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, sub: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn,
    });

    const newRefreshTokenId = uuidv4();
    const newRefreshToken = this.jwtService.sign(
      { sub: user._id, jti: newRefreshTokenId, role: user.role },
      {
        secret: this.jwtRefreshSecret,
        expiresIn: this.jwtRefreshExpiresIn,
      },
    );

    await this.userService.updateRefreshToken(user._id.toString(), newRefreshTokenId);

    return { accessToken, refreshToken: newRefreshToken };
  }
}