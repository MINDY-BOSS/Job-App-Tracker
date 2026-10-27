import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('Email already registered');
    }
    const user = await this.users.create({
      email,
      name: dto.name,
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email.toLowerCase());
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueToken(user);
  }

  private async issueToken(user: {
    id: string;
    email: string;
    name: string | null;
  }) {
    return {
      accessToken: await this.jwt.signAsync({
        sub: user.id,
        email: user.email,
      }),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
