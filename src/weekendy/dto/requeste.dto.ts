import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ReuestDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  mois: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  annee: string;
}
