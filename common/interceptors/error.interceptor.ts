/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    BadRequestException,
    InternalServerErrorException,
    HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError((error) => {
                let statusCode = 500;
                let message = 'Internal server error';

                if (error instanceof HttpException) {
                    statusCode = error.getStatus();
                    const response = error.getResponse();
                    message =
                        typeof response === 'string'
                            ? response
                            : (response as any).message || message;
                } else if (error instanceof BadRequestException) {
                    statusCode = 400;
                    message = error.message || 'Bad request';
                } else if (error instanceof InternalServerErrorException) {
                    statusCode = 500;
                    message = error.message || 'Internal server error';
                }

                return throwError(() => ({
                    error: true,
                    statusCode,
                    message,
                    data: null,
                }));
            }),
        );
    }
}
