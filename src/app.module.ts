import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import { PatientsModule } from './patients/patients.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { MedicationsModule } from './medications/medications.module';
import { Patient } from './patients/entities/patient.entity';
import { Prescription } from './prescriptions/entities/prescription.entity';
import { Medication } from './medications/entities/medication.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database:
        process.env.NODE_ENV === 'test'
          ? ':memory:'
          : join(process.cwd(), 'data', 'app.sqlite'),
      entities: [Patient, Prescription, Medication],
      synchronize: true,
      logging: process.env.NODE_ENV === 'test' ? false : ['error', 'warn'],
    }),
    PatientsModule,
    PrescriptionsModule,
    MedicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
