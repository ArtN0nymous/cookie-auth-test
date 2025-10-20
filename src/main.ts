import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from './environments/environment.prod';
import { CapacitorCookies } from '@capacitor/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IonicStorageModule } from '@ionic/storage-angular';
import { importProvidersFrom } from '@angular/core';

// Función helper para extraer CSRF token de las cookies usando Capacitor
async function getCsrfTokenFromCookie(): Promise<string | null> {
  try {
    // Obtener cookies de la URL específica de la API
    const cookies = await CapacitorCookies.getCookies({
      url: environment.apiUrl
    });
    console.log('Todas las cookies:', cookies);
    
    // HttpCookieMap no es iterable, usar Object.entries()
    for (const [name, cookie] of Object.entries(cookies)) {
      if (name === 'XSRF-TOKEN') {
        console.log('CSRF Token encontrado:', cookie);
        return decodeURIComponent(cookie);
      }
    }
    console.log('CSRF Token no encontrado en cookies');
    return null;
  } catch (error) {
    console.error('Error obteniendo cookies:', error);
    return null;
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(IonicStorageModule.forRoot()),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([
        // Interceptor para asegurar que las cookies se envíen y CSRF token
        (req, next) => {
          // Forzar withCredentials para todas las peticiones a la API
          if (req.url.startsWith(environment.apiUrl)) {
            console.log('req.url', req.url);
            console.log('envireomnet api key', environment.apiKey);
            
            const headers: any = {
              'X-API-Key': environment.apiKey,
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            };

            // Agregar X-CSRF-TOKEN para métodos que lo requieren
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
              // Usar from() para convertir Promise a Observable
              return from(getCsrfTokenFromCookie()).pipe(
                switchMap(csrfToken => {
                  if (csrfToken) {
                    headers['X-XSRF-TOKEN'] = csrfToken;
                    console.log('CSRF Token agregado:', csrfToken);
                  } else {
                    console.warn('CSRF Token no encontrado en cookies');
                  }

                  const modifiedReq = req.clone({
                    headers: new HttpHeaders(headers),
                    withCredentials: true
                  });

                  return next(modifiedReq);
                })
              );
            }

            req = req.clone({
              headers: new HttpHeaders(headers),
              withCredentials: true
            });
          }
          return next(req);
        }
      ])
    ),
  ],
});
