import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from './entities/medication.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { paginate } from '../common/utils/paginate.util';

@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(Medication)
    private readonly medicationRepo: Repository<Medication>,
  ) {}

  async create(dto: CreateMedicationDto): Promise<Medication> {
    const medication = this.medicationRepo.create(dto);
    return this.medicationRepo.save(medication);
  }

  async findAll(page = 1, limit = 10) {
    const [data, total] = await this.medicationRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });
    return paginate(data, total, page, limit);
  }

  async findOne(id: number): Promise<Medication> {
    const medication = await this.medicationRepo.findOne({ where: { id } });
    if (!medication) {
      throw new NotFoundException(`Medication with id ${id} not found`);
    }
    return medication;
  }

  async update(id: number, dto: UpdateMedicationDto): Promise<Medication> {
    const medication = await this.findOne(id);
    Object.assign(medication, dto);
    return this.medicationRepo.save(medication);
  }

  async remove(id: number): Promise<void> {
    const medication = await this.findOne(id);
    await this.medicationRepo.remove(medication);
  }
}
