import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { Patient } from '../patients/entities/patient.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { Medication } from '../medications/entities/medication.entity';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Medication)
    private readonly medicationRepo: Repository<Medication>,
  ) {}

  async create(patientId: number, dto: CreatePrescriptionDto) {
    const patient = await this.patientRepo.findOneBy({ id: patientId });
    if (!patient) throw new NotFoundException('Patient not found');

    const medication = await this.medicationRepo.findOneBy({
      id: dto.medicationId,
    });
    if (!medication) throw new NotFoundException('Medication not found');

    const prescription = this.prescriptionRepo.create({
      ...dto,
      patient,
      medication,
    });

    return this.prescriptionRepo.save(prescription);
  }

  async remove(id: number) {
    const prescription = await this.prescriptionRepo.findOneBy({ id });
    if (!prescription) throw new NotFoundException();
    await this.prescriptionRepo.remove(prescription);
  }
}
