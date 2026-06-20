import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  private async calcStock(itemId: string): Promise<number> {
    const agg = await this.prisma.stockMovement.groupBy({
      by: ['type'],
      where: { itemId },
      _sum: { quantity: true },
    });
    const inQty = agg.find((r) => r.type === 'IN')?._sum.quantity ?? 0;
    const outQty = agg.find((r) => r.type === 'OUT')?._sum.quantity ?? 0;
    return inQty - outQty;
  }

  async create(userId: string, dto: CreateItemDto) {
    return this.prisma.item.create({ data: { ...dto, userId } });
  }

  async findAll(userId: string) {
    const items = await this.prisma.item.findMany({
      where: { userId },
      include: { category: true, location: true, supplier: true },
      orderBy: { name: 'asc' },
    });
    return Promise.all(
      items.map(async (item) => ({
        ...item,
        stock: await this.calcStock(item.id),
      })),
    );
  }

  async findOne(userId: string, id: string) {
    const item = await this.prisma.item.findFirst({
      where: { id, userId },
      include: { category: true, location: true, supplier: true },
    });
    if (!item) throw new NotFoundException('Item não encontrado');
    return { ...item, stock: await this.calcStock(item.id) };
  }

  async findLowStock(userId: string) {
    const items = await this.prisma.item.findMany({
      where: { userId },
      include: { category: true, location: true },
    });
    const withStock = await Promise.all(
      items.map(async (item) => ({
        ...item,
        stock: await this.calcStock(item.id),
      })),
    );
    return withStock.filter((i) => i.stock <= i.minStock);
  }

  async update(userId: string, id: string, dto: CreateItemDto) {
    await this.findOne(userId, id);
    return this.prisma.item.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.item.delete({ where: { id } });
  }
}
