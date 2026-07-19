import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        (req, next) => {
          const isLocalhost = typeof window === 'undefined' || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
          if (!isLocalhost && req.url.startsWith('http://localhost:8080')) {
            const liveBackendUrl = 'https://school-backend-b6yr.onrender.com';
            const secureUrl = req.url.replace('http://localhost:8080', liveBackendUrl);
            const clonedReq = req.clone({ url: secureUrl });
            return next(clonedReq);
          }
          return next(req);
        }
      ])
    )
  ]
};
