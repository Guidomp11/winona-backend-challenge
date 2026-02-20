import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: PatientsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const id = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get(PatientsController);
    service = module.get(PatientsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create patient', async () => {
    const dto: CreatePatientDto = {
      firstName: 'Juan',
      lastName: 'Lastname',
      birthDate: '1990-01-15',
    };
    const result = { id, ...dto };

    mockService.create.mockResolvedValue(result);

    expect(await controller.create(dto)).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return paginated patients', async () => {
    const paginated = {
      data: [],
      meta: { total: 0, page: 1, lastPage: 0 },
    };

    mockService.findAll.mockResolvedValue(paginated);

    expect(await controller.findAll(1, 10)).toEqual(paginated);
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('should return one patient', async () => {
    const patient = {
      id,
      firstName: 'Juan',
      lastName: 'Lastname',
      birthDate: '1990-01-15',
    };

    mockService.findOne.mockResolvedValue(patient);

    expect(await controller.findOne(id)).toEqual(patient);
    expect(service.findOne).toHaveBeenCalledWith(id);
  });

  it('should update patient', async () => {
    const dto: UpdatePatientDto = { firstName: 'Pedro' };
    const updated = {
      id,
      firstName: 'Pedro',
      lastName: 'Lastname',
      birthDate: '1990-01-15',
    };

    mockService.update.mockResolvedValue(updated);

    expect(await controller.update(id, dto)).toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(id, dto);
  });

  it('should remove patient', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove(id);

    expect(service.remove).toHaveBeenCalledWith(id);
  });
});
