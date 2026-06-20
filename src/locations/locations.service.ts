import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateLocationDto) {
    const exists = await this.prisma.location.findUnique({
      where: { userId_name: { userId, name: dto.name } },
    });
    if (exists) throw new ConflictException('Local já existe');

    return this.prisma.location.create({ data: { ...dto, userId } });
  }

  findAll(userId: string) {
    return this.prisma.location.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const loc = await this.prisma.location.findFirst({ where: { id, userId } });
    if (!loc) throw new NotFoundException('Local não encontrado');
    return loc;
  }

  async update(userId: string, id: string, dto: CreateLocationDto) {
    await this.findOne(userId, id);
    return this.prisma.location.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.location.delete({ where: { id } });
  }
}
