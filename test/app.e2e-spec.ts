import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

interface ApiResponse<T> {
  status: string;
  data: T;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  birthDate?: string;
  prescriptions?: Prescription[];
}

interface Medication {
  id: number;
  name: string;
  description?: string;
}

interface Prescription {
  id: number;
  dosage: string;
  frequency: string;
}

interface PaginatedData<T> {
  data: T[];
  meta: { page: number; total: number };
}

interface ErrorResponse {
  status: string;
  statusCode: number;
  error: { message: string } | string;
}

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  describe('Root', () => {
    it('/ (GET) should return health check OK', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            status: 'success',
            data: 'OK',
          });
        });
    });
  });

  describe('Patients', () => {
    it('POST /patients - should create a patient', () => {
      return request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'Guido',
          lastName: 'Lastname',
          birthDate: '1990-01-15',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as ApiResponse<Patient>;
          expect(body.status).toBe('success');
          expect(body.data).toMatchObject({
            firstName: 'Guido',
            lastName: 'Lastname',
          });
          expect(body.data.id).toBeDefined();
        });
    });

    it('GET /patients - should return paginated patients', () => {
      return request(app.getHttpServer())
        .get('/patients?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          const body = res.body as ApiResponse<PaginatedData<Patient>>;
          expect(body.status).toBe('success');
          expect(body.data).toHaveProperty('data');
          expect(body.data).toHaveProperty('meta');
          expect(body.data.meta.page).toBe(1);
          expect(body.data.meta.total).toEqual(expect.any(Number));
        });
    });

    it('GET /patients/:id - should return a patient by id', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'Guido',
          lastName: 'Lastname',
          birthDate: '1985-05-20',
        });
      const id = (createRes.body as ApiResponse<Patient>).data.id;

      return request(app.getHttpServer())
        .get(`/patients/${id}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as ApiResponse<Patient>;
          expect(body.status).toBe('success');
          expect(body.data).toMatchObject({
            id,
            firstName: 'Guido',
            lastName: 'Lastname',
          });
        });
    });

    it('GET /patients/:id - should return 404 for non-existent patient', () => {
      return request(app.getHttpServer())
        .get('/patients/99999')
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          const message =
            typeof body.error === 'object' ? body.error.message : body.error;
          expect(message).toContain('Patient with id 99999 not found');
        });
    });

    it('PATCH /patients/:id - should update a patient', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'Guido',
          lastName: 'Lastname',
          birthDate: '1992-03-10',
        });
      const id = (createRes.body as ApiResponse<Patient>).data.id;

      return request(app.getHttpServer())
        .patch(`/patients/${id}`)
        .send({ firstName: 'Guido Updated' })
        .expect(200)
        .expect((res) => {
          const body = res.body as ApiResponse<Patient>;
          expect(body.data.firstName).toBe('Guido Updated');
          expect(body.data.lastName).toBe('Lastname');
        });
    });

    it('PATCH /patients/:id - should return 404 when patient does not exist', () => {
      return request(app.getHttpServer())
        .patch('/patients/99999')
        .send({ firstName: 'Updated' })
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          const message =
            typeof body.error === 'object' ? body.error.message : body.error;
          expect(message).toContain('Patient with id 99999 not found');
        });
    });

    it('DELETE /patients/:id - should delete a patient', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'ToDelete',
          lastName: 'Patient',
          birthDate: '2000-01-01',
        });
      const id = (createRes.body as ApiResponse<Patient>).data.id;

      await request(app.getHttpServer()).delete(`/patients/${id}`).expect(200);

      return request(app.getHttpServer())
        .get(`/patients/${id}`)
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          const message =
            typeof body.error === 'object' ? body.error.message : body.error;
          expect(message).toContain(`Patient with id ${id} not found`);
        });
    });

    it('DELETE /patients/:id - should return 404 when patient does not exist', () => {
      return request(app.getHttpServer())
        .delete('/patients/99999')
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          const message =
            typeof body.error === 'object' ? body.error.message : body.error;
          expect(message).toContain('Patient with id 99999 not found');
        });
    });
  });

  describe('Medications', () => {
    it('POST /medications - should create a medication', () => {
      return request(app.getHttpServer())
        .post('/medications')
        .send({ name: 'Ibuprofen', description: 'Pain reliever' })
        .expect(201)
        .expect((res) => {
          const body = res.body as ApiResponse<Medication>;
          expect(body.status).toBe('success');
          expect(body.data).toMatchObject({
            name: 'Ibuprofen',
            description: 'Pain reliever',
          });
          expect(body.data.id).toBeDefined();
        });
    });

    it('GET /medications - should return paginated medications', () => {
      return request(app.getHttpServer())
        .get('/medications?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          const body = res.body as ApiResponse<PaginatedData<Medication>>;
          expect(body.status).toBe('success');
          expect(body.data).toHaveProperty('data');
          expect(body.data).toHaveProperty('meta');
        });
    });

    it('GET /medications/:id - should return a medication by id', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/medications')
        .send({ name: 'Paracetamol' });
      const id = (createRes.body as ApiResponse<Medication>).data.id;

      return request(app.getHttpServer())
        .get(`/medications/${id}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as ApiResponse<Medication>;
          expect(body.data).toMatchObject({ id, name: 'Paracetamol' });
        });
    });

    it('GET /medications/:id - should return 404 for non-existent medication', () => {
      return request(app.getHttpServer())
        .get('/medications/99999')
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          const message =
            typeof body.error === 'object' ? body.error.message : body.error;
          expect(message).toContain('Medication with id 99999 not found');
        });
    });

    it('PATCH /medications/:id - should update a medication', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/medications')
        .send({ name: 'Aspirin' });
      const id = (createRes.body as ApiResponse<Medication>).data.id;

      return request(app.getHttpServer())
        .patch(`/medications/${id}`)
        .send({ name: 'Aspirin 500mg' })
        .expect(200)
        .expect((res) => {
          const body = res.body as ApiResponse<Medication>;
          expect(body.data.name).toBe('Aspirin 500mg');
        });
    });

    it('PATCH /medications/:id - should return 404 when medication does not exist', () => {
      return request(app.getHttpServer())
        .patch('/medications/99999')
        .send({ name: 'Updated' })
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          const message =
            typeof body.error === 'object' ? body.error.message : body.error;
          expect(message).toContain('Medication with id 99999 not found');
        });
    });

    it('DELETE /medications/:id - should delete a medication', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/medications')
        .send({ name: 'ToDeleteMed' });
      const id = (createRes.body as ApiResponse<Medication>).data.id;

      await request(app.getHttpServer())
        .delete(`/medications/${id}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/medications/${id}`)
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          const message =
            typeof body.error === 'object' ? body.error.message : body.error;
          expect(message).toContain(`Medication with id ${id} not found`);
        });
    });

    it('DELETE /medications/:id - should return 404 when medication does not exist', () => {
      return request(app.getHttpServer())
        .delete('/medications/99999')
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          const message =
            typeof body.error === 'object' ? body.error.message : body.error;
          expect(message).toContain('Medication with id 99999 not found');
        });
    });
  });

  describe('Prescriptions', () => {
    it('POST /patients/:patientId/prescriptions - should create a prescription', async () => {
      const [patientRes, medRes] = await Promise.all([
        request(app.getHttpServer()).post('/patients').send({
          firstName: 'Guido',
          lastName: 'Lastname',
          birthDate: '1988-07-12',
        }),
        request(app.getHttpServer())
          .post('/medications')
          .send({ name: 'Amoxicillin' }),
      ]);
      const patientId = (patientRes.body as ApiResponse<Patient>).data.id;
      const medicationId = (medRes.body as ApiResponse<Medication>).data.id;

      return request(app.getHttpServer())
        .post(`/patients/${patientId}/prescriptions`)
        .send({
          medicationId,
          dosage: '500mg',
          frequency: 'Every 8 hours',
          startDate: '2024-01-01',
          endDate: '2024-01-10',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as ApiResponse<Prescription>;
          expect(body.status).toBe('success');
          expect(body.data).toMatchObject({
            dosage: '500mg',
            frequency: 'Every 8 hours',
          });
          expect(body.data.id).toBeDefined();
        });
    });

    it('POST /patients/:patientId/prescriptions - should return 404 for non-existent patient', async () => {
      const medRes = await request(app.getHttpServer())
        .post('/medications')
        .send({ name: 'TestMed' });
      const medicationId = (medRes.body as ApiResponse<Medication>).data.id;

      return request(app.getHttpServer())
        .post('/patients/99999/prescriptions')
        .send({
          medicationId,
          dosage: '500mg',
          frequency: '8h',
          startDate: '2024-01-01',
          endDate: '2024-01-10',
        })
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          const message =
            typeof body.error === 'object' ? body.error.message : body.error;
          expect(message).toContain('Patient not found');
        });
    });

    it('POST /patients/:patientId/prescriptions - should return 404 for non-existent medication', async () => {
      const patientRes = await request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'Guido',
          lastName: 'Lastname',
          birthDate: '1990-01-15',
        });
      const patientId = (patientRes.body as ApiResponse<Patient>).data.id;

      return request(app.getHttpServer())
        .post(`/patients/${patientId}/prescriptions`)
        .send({
          medicationId: 99999,
          dosage: '500mg',
          frequency: '8h',
          startDate: '2024-01-01',
          endDate: '2024-01-10',
        })
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          const message =
            typeof body.error === 'object' ? body.error.message : body.error;
          expect(message).toContain('Medication not found');
        });
    });

    it('DELETE /patients/:patientId/prescriptions/:prescriptionId - should delete a prescription', async () => {
      const [patientRes, medRes] = await Promise.all([
        request(app.getHttpServer()).post('/patients').send({
          firstName: 'Guido',
          lastName: 'Lastname',
          birthDate: '1995-11-25',
        }),
        request(app.getHttpServer())
          .post('/medications')
          .send({ name: 'Vitamin D' }),
      ]);
      const patientId = (patientRes.body as ApiResponse<Patient>).data.id;
      const medicationId = (medRes.body as ApiResponse<Medication>).data.id;

      const prescRes = await request(app.getHttpServer())
        .post(`/patients/${patientId}/prescriptions`)
        .send({
          medicationId,
          dosage: '500mg',
          frequency: 'Daily',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });
      const prescriptionId = (prescRes.body as ApiResponse<Prescription>).data
        .id;

      await request(app.getHttpServer())
        .delete(`/patients/${patientId}/prescriptions/${prescriptionId}`)
        .expect(200);

      const patientAfter = await request(app.getHttpServer()).get(
        `/patients/${patientId}`,
      );
      const patientData = (patientAfter.body as ApiResponse<Patient>).data;
      const prescriptions: Prescription[] = patientData.prescriptions ?? [];
      expect(
        prescriptions.find((p) => p.id === prescriptionId),
      ).toBeUndefined();
    });

    it('DELETE /patients/:patientId/prescriptions/:prescriptionId - should return 404 when prescription does not exist', async () => {
      const patientRes = await request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'Guido',
          lastName: 'Lastname',
          birthDate: '1990-01-15',
        });
      const patientId = (patientRes.body as ApiResponse<Patient>).data.id;

      return request(app.getHttpServer())
        .delete(`/patients/${patientId}/prescriptions/99999`)
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          const message =
            typeof body.error === 'object' ? body.error.message : body.error;
          expect(message).toBeDefined();
          expect(message).toMatch(/not found|Not Found/i);
        });
    });

    it('prescription lookup by patientId uses index', async () => {
      const patientRes = await request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'Index',
          lastName: 'Test',
          birthDate: '1990-01-01',
        });
      const patientId = (patientRes.body as ApiResponse<Patient>).data.id;

      const dataSource = app.get(DataSource);
      const result = await dataSource.query<Array<{ detail: string }>>(
        'EXPLAIN QUERY PLAN SELECT * FROM prescription WHERE patientId = ?',
        [patientId],
      );
      const plan = result.map((r) => r.detail).join(' ');
      expect(plan).toMatch(/SEARCH.*prescription.*(INDEX|patientId)/i);
    });
  });
});
