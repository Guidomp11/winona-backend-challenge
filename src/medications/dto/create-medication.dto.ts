import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicationDto {
  @ApiProperty({
    example: 'Ibuprofen',
    description: 'Medication name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Nonsteroidal anti-inflammatory drug',
    description: 'Optional medication description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
