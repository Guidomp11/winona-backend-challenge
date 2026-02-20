import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Prescription } from '../../prescriptions/entities/prescription.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Medication {
  @ApiProperty({ example: 1, description: 'Unique medication ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Ibuprofen' })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Nonsteroidal anti-inflammatory drug',
    required: false,
  })
  @Column({ nullable: true })
  description: string;

  @ApiHideProperty()
  @OneToMany(() => Prescription, (p) => p.medication)
  prescriptions: Prescription[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
