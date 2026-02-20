import { IsString, IsNotEmpty, IsDateString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePrescriptionDto {
  @ApiProperty({
    example: 1,
    description:
      'ID of the medication to prescribe (must exist in the catalog)',
  })
  @IsInt()
  @Type(() => Number)
  medicationId: number;

  @ApiProperty({
    example: '500mg',
    description: 'Dosage to administer',
  })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({
    example: 'Every 8 hours',
    description: 'Administration frequency',
  })
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Treatment start date (ISO 8601: YYYY-MM-DD)',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2024-01-10',
    description: 'Treatment end date (ISO 8601: YYYY-MM-DD)',
  })
  @IsDateString()
  endDate: string;
}
