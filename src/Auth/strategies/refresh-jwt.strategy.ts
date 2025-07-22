import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../User/user.service';
import { User, UserDocument } from '../../User/schemas/user.schema';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {


  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const refreshSecret = configService.get<string>('jwt.refreshSecret');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET env o‘zgaruvchisi o‘rnatilmagan.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          if (req?.cookies && req.cookies['refreshToken']) {
            return req.cookies['refreshToken'];
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: refreshSecret, 
    });

 
  }

  async validate(payload: any): Promise<Partial<UserDocument> | null> { 
    const user = await this.userService.findById(payload.sub as string);

    if (!user || user.refreshToken !== payload.jti) {
      throw new UnauthorizedException('Refresh token yaroqsiz.');
    }

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.otp;
    delete userWithoutPassword.otpExpires;
    delete userWithoutPassword.refreshToken;

    return userWithoutPassword;
  }
}