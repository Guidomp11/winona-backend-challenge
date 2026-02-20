import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MedicationsService } from './medications.service';
import { Medication } from './entities/medication.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

describe('MedicationsService', () => {
  let service: MedicationsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  const mockMedication: Partial<Medication> = {
    id: 1,
    name: 'Ibuprofen',
    description: 'Pain reliever',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicationsService,
        {
          provide: getRepositoryToken(Medication),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MedicationsService>(MedicationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a medication', async () => {
      const dto: CreateMedicationDto = {
        name: 'Ibuprofen',
        description: 'Pain reliever',
      };
      mockRepository.create.mockReturnValue(mockMedication);
      mockRepository.save.mockResolvedValue({ ...mockMedication, ...dto });

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return paginated medications', async () => {
      const data = [mockMedication];
      mockRepository.findAndCount.mockResolvedValue([data, 1]);

      const result = await service.findAll(1, 10);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
      });
      expect(result.data).toEqual(data);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a medication by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMedication);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockMedication);
    });

    it('should throw NotFoundException when medication not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Medication with id 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a medication', async () => {
      const existing = { ...mockMedication };
      const dto: UpdateMedicationDto = { name: 'Ibuprofen Plus' };
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockResolvedValue({ ...existing, ...dto });

      const result = await service.update(1, dto);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Ibuprofen Plus');
    });
  });

  describe('remove', () => {
    it('should remove a medication', async () => {
      mockRepository.findOne.mockResolvedValue(mockMedication);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockMedication);
    });
  });
});
