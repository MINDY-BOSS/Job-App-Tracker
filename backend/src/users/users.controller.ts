import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Patch,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch()
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.users.update(user.id, { name: dto.name.trim() });
    return { id: updated.id, email: updated.email, name: updated.name };
  }

  @Patch('password')
  @HttpCode(200)
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    const record = await this.users.findById(user.id);
    if (
      !record ||
      !(await bcrypt.compare(dto.currentPassword, record.passwordHash))
    ) {
      // 400, not 401: the frontend treats 401 as an expired session and logs out.
      throw new BadRequestException('Current password is incorrect');
    }
    await this.users.update(user.id, {
      passwordHash: await bcrypt.hash(dto.newPassword, 10),
    });
    return { message: 'Password updated' };
  }
}
