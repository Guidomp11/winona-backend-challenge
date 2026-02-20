import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Verifies that the server is running and responding correctly.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is operational',
    schema: { type: 'string', example: 'OK' },
  })
  healthCheck(): string {
    return 'OK';
  }
}
