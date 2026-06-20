import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  private async currentStock(itemId: string): Promise<number> {
    const agg = await this.prisma.stockMovement.groupBy({
      by: ['type'],
      where: { itemId },
      _sum: { quantity: true },
    });
    const inQty = agg.find((r) => r.type === 'IN')?._sum.quantity ?? 0;
    const outQty = agg.find((r) => r.type === 'OUT')?._sum.quantity ?? 0;
    return inQty - outQty;
  }

  async create(userId: string, dto: CreateMovementDto) {
    const item = await this.prisma.item.findFirst({
      where: { id: dto.itemId, userId },
    });
    if (!item) throw new NotFoundException('Item não encontrado');

    if (dto.type === 'OUT') {
      const stock = await this.currentStock(dto.itemId);
      if (dto.quantity > stock) {
        throw new BadRequestException(
          `Saldo insuficiente. Disponível: ${stock}, solicitado: ${dto.quantity}`,
        );
      }
    }

    return this.prisma.stockMovement.create({
      data: { ...dto, userId },
      include: { item: true },
    });
  }

  findAll(userId: string, itemId?: string) {
    return this.prisma.stockMovement.findMany({
      where: { userId, ...(itemId ? { itemId } : {}) },
      include: { item: { select: { id: true, name: true, sku: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const mov = await this.prisma.stockMovement.findFirst({
      where: { id, userId },
      include: { item: true },
    });
    if (!mov) throw new NotFoundException('Movimentação não encontrada');
    return mov;
  }
}
