import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import {
  ApiCreate,
  ApiPaginatedList,
  ApiGetOne,
  ApiUpdate,
  ApiDelete,
} from '../common/swagger/api-decorators';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { Medication } from './entities/medication.entity';

@ApiTags('Medications')
@ApiExtraModels(Medication)
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  @ApiCreate('Medication', CreateMedicationDto, {
    summary: 'Create medication',
    description:
      'Registers a new medication with name and optional description.',
    badRequest: 'Invalid data or duplicate name',
  })
  create(@Body() dto: CreateMedicationDto) {
    return this.medicationsService.create(dto);
  }

  @Get()
  @ApiPaginatedList('Medication', {
    summary: 'List medications',
    description:
      'Retrieves the medication catalog with pagination. Defaults to page 1 with 10 records.',
  })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.medicationsService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiGetOne('Medication', {
    summary: 'Get medication by ID',
    description: 'Returns a specific medication by its numeric ID.',
    notFound: 'Medication not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdate('Medication', UpdateMedicationDto, {
    summary: 'Update medication',
    description:
      'Partially updates an existing medication. Only sent fields are modified.',
    notFound: 'Medication not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicationDto,
  ) {
    return this.medicationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiDelete({
    summary: 'Delete medication',
    description:
      'Removes a medication from the catalog. Verify it has no associated prescriptions.',
    notFound: 'Medication not found',
    badRequest: 'Invalid ID or medication in use',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicationsService.remove(id);
  }
}
