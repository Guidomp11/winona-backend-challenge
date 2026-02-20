import { Test } from '@nestjs/testing';
import { PrescriptionsController } from './prescription.controller';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

describe('PrescriptionsController', () => {
  let controller: PrescriptionsController;
  let service: PrescriptionsService;

  const mockService = {
    create: jest.fn(),
    remove: jest.fn(),
  };

  const patientId = 1;
  const prescriptionId = 1;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [PrescriptionsController],
      providers: [{ provide: PrescriptionsService, useValue: mockService }],
    }).compile();

    controller = module.get(PrescriptionsController);
    service = module.get(PrescriptionsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create prescription', async () => {
    const dto: CreatePrescriptionDto = {
      medicationId: 1,
      dosage: '500mg',
      frequency: 'Every 8 hours',
      startDate: '2024-01-01',
      endDate: '2024-01-10',
    };

    mockService.create.mockResolvedValue({ id: prescriptionId });

    expect(await controller.create(patientId, dto)).toEqual({
      id: prescriptionId,
    });
    expect(service.create).toHaveBeenCalledWith(patientId, dto);
  });

  it('should delete prescription', async () => {
    await controller.remove(patientId, prescriptionId);

    expect(service.remove).toHaveBeenCalledWith(prescriptionId);
  });
});
