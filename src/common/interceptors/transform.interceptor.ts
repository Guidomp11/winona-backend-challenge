import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  { data: T; status: string }
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ status: string; data: T }> {
    return next.handle().pipe(
      map((data: T) => ({
        status: 'success',
        data,
      })),
    );
  }
}
