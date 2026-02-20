import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescription.controller';
import { Prescription } from './entities/prescription.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Medication } from '../medications/entities/medication.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prescription, Patient, Medication])],
  providers: [PrescriptionsService],
  controllers: [PrescriptionsController],
})
export class PrescriptionsModule {}
