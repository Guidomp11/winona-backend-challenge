import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Medication } from '../../medications/entities/medication.entity';
import { Patient } from '../../patients/entities/patient.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Prescription {
  @ApiProperty({ example: 1, description: 'Unique prescription ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiHideProperty()
  @Index()
  @ManyToOne(() => Patient, (patient) => patient.prescriptions, {
    onDelete: 'CASCADE',
  })
  patient: Patient;

  @ApiHideProperty()
  @ManyToOne(() => Medication, (medication) => medication.prescriptions)
  medication: Medication;

  @ApiProperty({ example: '500mg' })
  @Column()
  dosage: string;

  @ApiProperty({ example: 'Every 8 hours' })
  @Column()
  frequency: string;

  @ApiProperty({ example: '2024-01-01' })
  @Column({ type: 'date' })
  startDate: Date;

  @ApiProperty({ example: '2024-01-10', required: false })
  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
