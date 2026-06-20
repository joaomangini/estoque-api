import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAssetDto) {
    const exists = await this.prisma.asset.findUnique({
      where: { userId_tag: { userId, tag: dto.tag } },
    });
    if (exists) throw new ConflictException(`Tag de patrimônio '${dto.tag}' já cadastrada`);

    return this.prisma.asset.create({
      data: { ...dto, userId },
      include: { location: true },
    });
  }

  findAll(userId: string) {
    return this.prisma.asset.findMany({
      where: { userId },
      include: { location: true },
      orderBy: { tag: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, userId },
      include: { location: true },
    });
    if (!asset) throw new NotFoundException('Patrimônio não encontrado');
    return asset;
  }

  async update(userId: string, id: string, dto: CreateAssetDto) {
    await this.findOne(userId, id);
    return this.prisma.asset.update({
      where: { id },
      data: dto,
      include: { location: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.asset.delete({ where: { id } });
  }
}
