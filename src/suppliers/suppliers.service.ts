import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: { ...dto, userId } });
  }

  findAll(userId: string) {
    return this.prisma.supplier.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const sup = await this.prisma.supplier.findFirst({ where: { id, userId } });
    if (!sup) throw new NotFoundException('Fornecedor não encontrado');
    return sup;
  }

  async update(userId: string, id: string, dto: CreateSupplierDto) {
    await this.findOne(userId, id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.supplier.delete({ where: { id } });
  }
}
