import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PrescriptionsService } from './prescriptions.service';
import { Prescription } from './entities/prescription.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Medication } from '../medications/entities/medication.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;

  const mockPatient = { id: 1, firstName: 'Guido', lastName: 'Lastname' };
  const mockMedication = { id: 1, name: 'Ibuprofen' };
  const mockPrescription = { id: 1, dosage: '500mg', patient: mockPatient };

  const mockPrescriptionRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  const mockPatientRepo = {
    findOneBy: jest.fn(),
  };

  const mockMedicationRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionsService,
        {
          provide: getRepositoryToken(Prescription),
          useValue: mockPrescriptionRepo,
        },
        { provide: getRepositoryToken(Patient), useValue: mockPatientRepo },
        {
          provide: getRepositoryToken(Medication),
          useValue: mockMedicationRepo,
        },
      ],
    }).compile();

    service = module.get<PrescriptionsService>(PrescriptionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a prescription', async () => {
      const dto: CreatePrescriptionDto = {
        medicationId: 1,
        dosage: '500mg',
        frequency: 'Every 8 hours',
        startDate: '2024-01-01',
        endDate: '2024-01-10',
      };
      mockPatientRepo.findOneBy.mockResolvedValue(mockPatient);
      mockMedicationRepo.findOneBy.mockResolvedValue(mockMedication);
      mockPrescriptionRepo.create.mockReturnValue(mockPrescription);
      mockPrescriptionRepo.save.mockResolvedValue({
        ...mockPrescription,
        id: 1,
      });

      const result = await service.create(1, dto);

      expect(mockPatientRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockMedicationRepo.findOneBy).toHaveBeenCalledWith({
        id: dto.medicationId,
      });
      expect(mockPrescriptionRepo.create).toHaveBeenCalledWith({
        ...dto,
        patient: mockPatient,
        medication: mockMedication,
      });
      expect(mockPrescriptionRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when patient not found', async () => {
      mockPatientRepo.findOneBy.mockResolvedValue(null);

      const dto: CreatePrescriptionDto = {
        medicationId: 1,
        dosage: '500mg',
        frequency: '8h',
        startDate: '2024-01-01',
        endDate: '2024-01-10',
      };

      await expect(service.create(999, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when medication not found', async () => {
      mockPatientRepo.findOneBy.mockResolvedValue(mockPatient);
      mockMedicationRepo.findOneBy.mockResolvedValue(null);

      const dto: CreatePrescriptionDto = {
        medicationId: 999,
        dosage: '500mg',
        frequency: '8h',
        startDate: '2024-01-01',
        endDate: '2024-01-10',
      };

      await expect(service.create(1, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a prescription', async () => {
      mockPrescriptionRepo.findOneBy.mockResolvedValue(mockPrescription);
      mockPrescriptionRepo.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockPrescriptionRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockPrescriptionRepo.remove).toHaveBeenCalledWith(
        mockPrescription,
      );
    });

    it('should throw NotFoundException when prescription not found', async () => {
      mockPrescriptionRepo.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
