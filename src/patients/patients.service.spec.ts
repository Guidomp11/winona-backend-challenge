import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

describe('PatientsService', () => {
  let service: PatientsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  const mockPatient: Partial<Patient> = {
    id: 1,
    firstName: 'Juan',
    lastName: 'Lastname',
    dateOfBirth: new Date('1990-01-15'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a patient', async () => {
      const dto: CreatePatientDto = {
        firstName: 'Juan',
        lastName: 'Lastname',
        birthDate: '1990-01-15',
      };
      mockRepository.create.mockReturnValue(mockPatient);
      mockRepository.save.mockResolvedValue({ ...mockPatient });

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.birthDate),
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return paginated patients', async () => {
      const data = [mockPatient];
      mockRepository.findAndCount.mockResolvedValue([data, 1]);

      const result = await service.findAll(1, 10);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['prescriptions', 'prescriptions.medication'],
        skip: 0,
        take: 10,
        order: { id: 'DESC' },
      });
      expect(result.data).toEqual(data);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockPatient);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['prescriptions', 'prescriptions.medication'],
      });
      expect(result).toEqual(mockPatient);
    });

    it('should throw NotFoundException when patient not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Patient with id 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const existing = { ...mockPatient } as Patient;
      const dto: UpdatePatientDto = { firstName: 'Pedro' };
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockResolvedValue({
        ...existing,
        firstName: 'Pedro',
      });

      const result = await service.update(1, dto);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.firstName).toBe('Pedro');
    });
  });

  describe('remove', () => {
    it('should remove a patient', async () => {
      mockRepository.findOne.mockResolvedValue(mockPatient);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['prescriptions', 'prescriptions.medication'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockPatient);
    });
  });
});
