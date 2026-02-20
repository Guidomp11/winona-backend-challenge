import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { paginate } from '../common/utils/paginate.util';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientRepository.create({
      firstName: createPatientDto.firstName,
      lastName: createPatientDto.lastName,
      dateOfBirth: new Date(createPatientDto.birthDate),
    });
    return this.patientRepository.save(patient);
  }

  async findAll(page = 1, limit = 10) {
    const [data, total] = await this.patientRepository.findAndCount({
      relations: ['prescriptions', 'prescriptions.medication'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return paginate(data, total, page, limit);
  }

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['prescriptions', 'prescriptions.medication'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found`);
    }

    return patient;
  }

  async update(id: number, updateDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);

    if (updateDto.firstName !== undefined)
      patient.firstName = updateDto.firstName;
    if (updateDto.lastName !== undefined) patient.lastName = updateDto.lastName;
    if (updateDto.birthDate !== undefined)
      patient.dateOfBirth = new Date(updateDto.birthDate);

    return this.patientRepository.save(patient);
  }

  async remove(id: number): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
  }
}
