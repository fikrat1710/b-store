import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../User/user.service';
import { User, UserDocument } from '../../User/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT_SECRET env o‘zgaruvchisi o‘rnatilmagan.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          if (req?.cookies && req.cookies['accessToken']) {
            return req.cookies['accessToken'];
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any): Promise<Partial<UserDocument>> {
    const userIdString = payload.sub.toString(); 
    const user = await this.userService.findById(userIdString); 

    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi.');
    }

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }
}