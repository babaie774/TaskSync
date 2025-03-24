import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  IBaseResponse,
  IPaginatedResponse,
} from '../interfaces/base-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, IBaseResponse<T>>
{
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IBaseResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `${method} ${url} ${Date.now() - now}ms`,
          'TransformInterceptor',
        );
      }),
      map((data) => {
        const baseResponse: IBaseResponse<T> = {
          data,
          timestamp: new Date().toISOString(),
          path: url,
        };

        // Handle paginated responses
        if (Array.isArray(data) && 'page' in request.query) {
          const page = parseInt(request.query.page, 10) || 1;
          const limit = parseInt(request.query.limit, 10) || 10;
          const total = data.length;
          const totalPages = Math.ceil(total / limit);

          (baseResponse as IPaginatedResponse<T>).meta = {
            page,
            limit,
            total,
            totalPages,
          };
        }

        return baseResponse;
      }),
    );
  }
}
