/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class ResponseInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any>{
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        return next.handle().pipe(
            map((data) => {
                let message = 'Request successful';
                let count;

                // Assign message based on HTTP method
                switch (method) {
                    case 'POST':
                        message = 'Created successfully';
                        break;
                    case 'PATCH':
                    case 'PUT':
                        message = 'Updated Successfully';
                        break;
                    case 'DELETE':
                        message = 'Deleted Successfully';
                        break;
                    case 'GET':
                    default:
                        message = 'Request successful';
                }

                // Count items if data is an array
                if (Array.isArray(data)) {
                    count = data.length;
                } else if (data?.data && Array.isArray(data.data)) {
                    count = data.data.length;
                }

                return {
                    error: false,
                    message,
                    data,
                    count
                }
            })
        )
    }
}