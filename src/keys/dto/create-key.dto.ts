import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateKeyDto {
  @IsString()
  @IsNotEmpty({ message: 'Dê um nome para identificar a chave' })
  @MaxLength(60, { message: 'O nome deve ter no máximo 60 caracteres' })
  name: string;
}
