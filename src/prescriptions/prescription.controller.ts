import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { Prescription } from './entities/prescription.entity';
import { SWAGGER_RESPONSES } from '../common/swagger/swagger-responses';

@ApiTags('Prescriptions')
@ApiExtraModels(Prescription)
@Controller('patients/:patientId/prescriptions')
export class PrescriptionsController {
  constructor(private readonly service: PrescriptionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create prescription',
    description:
      'Creates a new medical prescription for a patient, associating a medication with dosage, frequency and treatment period.',
  })
  @ApiParam({
    name: 'patientId',
    type: Number,
    description: 'ID of the patient to assign the prescription to',
    example: 1,
  })
  @ApiBody({
    type: CreatePrescriptionDto,
    description: 'Prescription data (medication, dosage, frequency, dates)',
  })
  @ApiResponse({
    status: 201,
    description: 'Prescription created successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: { $ref: '#/components/schemas/Prescription' },
      },
    },
  })
  @ApiResponse(SWAGGER_RESPONSES.notFound('Patient or medication not found'))
  @ApiResponse(
    SWAGGER_RESPONSES.badRequest('Invalid data or inconsistent dates'),
  )
  @ApiResponse(SWAGGER_RESPONSES.internalError())
  create(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Body() dto: CreatePrescriptionDto,
  ) {
    return this.service.create(patientId, dto);
  }

  @Delete(':prescriptionId')
  @ApiOperation({
    summary: 'Delete prescription',
    description: 'Removes a medical prescription from the system.',
  })
  @ApiParam({
    name: 'patientId',
    type: Number,
    description: 'Patient ID (used in the route)',
    example: 1,
  })
  @ApiParam({
    name: 'prescriptionId',
    type: Number,
    description: 'ID of the prescription to delete',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription deleted successfully',
  })
  @ApiResponse(SWAGGER_RESPONSES.notFound('Prescription not found'))
  @ApiResponse(SWAGGER_RESPONSES.badRequest('Invalid ID'))
  @ApiResponse(SWAGGER_RESPONSES.internalError())
  remove(
    @Param('patientId', ParseIntPipe) _patientId: number,
    @Param('prescriptionId', ParseIntPipe) prescriptionId: number,
  ) {
    return this.service.remove(prescriptionId);
  }
}
