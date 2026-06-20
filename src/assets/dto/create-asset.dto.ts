import { AssetStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tag: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  responsible?: string;

  @IsUUID()
  @IsOptional()
  locationId?: string;
}
