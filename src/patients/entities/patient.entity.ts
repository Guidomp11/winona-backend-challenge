import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Prescription } from '../../prescriptions/entities/prescription.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Patient {
  @ApiProperty({ example: 1, description: 'Unique patient ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Guido' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Lastname' })
  @Column()
  lastName: string;

  @ApiProperty({
    example: '1999-01-01',
    description: 'Date of birth (ISO format)',
  })
  @Column({ type: 'date' })
  dateOfBirth: Date;

  @ApiHideProperty()
  @OneToMany(() => Prescription, (p) => p.patient)
  prescriptions: Prescription[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
