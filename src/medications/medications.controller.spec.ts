import { Test } from '@nestjs/testing';
import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

describe('MedicationsController', () => {
  let controller: MedicationsController;
  let service: MedicationsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const id = 1;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MedicationsController],
      providers: [{ provide: MedicationsService, useValue: mockService }],
    }).compile();

    controller = module.get(MedicationsController);
    service = module.get(MedicationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create medication', async () => {
    const dto: CreateMedicationDto = { name: 'Ibuprofen' };
    const result = { id, ...dto };

    mockService.create.mockResolvedValue(result);

    expect(await controller.create(dto)).toEqual(result);
  });

  it('should paginate medications', async () => {
    const paginated = {
      data: [],
      meta: { total: 0, page: 1, lastPage: 0 },
    };

    mockService.findAll.mockResolvedValue(paginated);

    expect(await controller.findAll(1, 10)).toEqual(paginated);
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('should find one', async () => {
    mockService.findOne.mockResolvedValue({ id });

    expect(await controller.findOne(id)).toEqual({ id });
  });

  it('should update medication', async () => {
    const dto: UpdateMedicationDto = {
      name: 'Updated Ibuprofen',
      description: 'Updated',
    };
    const updated = { id, ...dto };

    mockService.update.mockResolvedValue(updated);

    expect(await controller.update(id, dto)).toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(id, dto);
  });

  it('should remove medication', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove(id);
    expect(service.remove).toHaveBeenCalledWith(id);
  });
});
