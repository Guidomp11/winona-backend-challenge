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
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';

@ApiTags('Patients')
@ApiExtraModels(Patient)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiCreate('Patient', CreatePatientDto, {
    summary: 'Create patient',
    description:
      'Registers a new patient with first name, last name and date of birth.',
    badRequest: 'Invalid data or missing required fields',
  })
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  @Get()
  @ApiPaginatedList('Patient', {
    summary: 'List patients',
    description:
      'Retrieves patients with pagination. Defaults to page 1 with 10 records.',
  })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.patientsService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiGetOne('Patient', {
    summary: 'Get patient by ID',
    description: 'Returns a specific patient by numeric ID.',
    notFound: 'Patient not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdate('Patient', UpdatePatientDto, {
    summary: 'Update patient',
    description:
      'Partially updates an existing patient. Only sent fields are modified.',
    notFound: 'Patient not found',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }

  @Delete(':id')
  @ApiDelete({
    summary: 'Delete patient',
    description:
      'Removes a patient. Associated prescriptions are deleted in cascade.',
    notFound: 'Patient not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.remove(id);
  }
}
