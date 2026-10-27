import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: string, data: { name?: string; passwordHash?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  create(data: { email: string; passwordHash: string; name?: string }) {
    return this.prisma.user.create({ data });
  }
}
