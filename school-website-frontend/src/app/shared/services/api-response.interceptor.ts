import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse && event.body && typeof event.body === 'object') {
        const body = event.body as any;
        if ('success' in body && 'data' in body) {
          return event.clone({ body: body.data });
        }
      }
      return event;
    })
  );
};
