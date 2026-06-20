import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/types/jwt-payload';
import { CreateKeyDto } from './dto/create-key.dto';

@Injectable()
export class KeysService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gera uma nova API Key para o usuário. A chave em texto puro é retornada
   * UMA ÚNICA VEZ aqui — no banco guardamos apenas o hash (sha256).
   */
  async create(userId: string, dto: CreateKeyDto) {
    const key = `fin_${randomBytes(32).toString('hex')}`;
    const hashedKey = this.hash(key);
    const prefix = key.slice(0, 12); // ex.: "fin_a1b2c3d4"

    const created = await this.prisma.apiKey.create({
      data: { name: dto.name, hashedKey, prefix, userId },
      select: { id: true, name: true, prefix: true, createdAt: true },
    });

    return {
      ...created,
      key, // texto puro — copie agora, não será mostrado de novo
    };
  }

  /** Lista as chaves do usuário (sem nunca expor o segredo). */
  findAll(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        prefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Revoga (apaga) uma chave do usuário. */
  async remove(userId: string, id: string) {
    const key = await this.prisma.apiKey.findFirst({ where: { id, userId } });
    if (!key) {
      throw new NotFoundException('Chave não encontrada');
    }
    await this.prisma.apiKey.delete({ where: { id } });
  }

  /**
   * Valida uma chave recebida no header `x-api-key` e devolve o usuário dono.
   * Usado pelo JwtAuthGuard. Retorna null se a chave for inválida.
   */
  async validate(rawKey: string): Promise<AuthUser | null> {
    const hashedKey = this.hash(rawKey);
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { hashedKey },
      select: { id: true, user: { select: { id: true, email: true, role: true } } },
    });
    if (!apiKey) {
      return null;
    }

    // registra o uso sem bloquear a resposta
    void this.prisma.apiKey
      .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
      .catch(() => undefined);

    return {
      id: apiKey.user.id,
      email: apiKey.user.email,
      role: apiKey.user.role,
    };
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
