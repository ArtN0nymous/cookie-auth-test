# AUTH COOKIES LARAVEL - IONIC

Este proyecto implementa autenticación basada en cookies entre una aplicación Ionic/Angular y un backend Laravel usando Laravel Sanctum.

## 📋 Requisitos Previos

- Node.js (v20 o superior)
- Angular CLI
- Ionic CLI
- Capacitor
- Backend Laravel con Sanctum configurado

## 🔧 Configuración

### 1. Configuración de iOS (Info.plist)

Para que las cookies funcionen correctamente en dispositivos iOS, es necesario agregar el dominio de tu API a la lista de dominios vinculados a la aplicación.

Edita el archivo `ios/App/App/Info.plist` y agrega:

```xml
<key>WKAppBoundDomains</key>
<array>
    <string>your-api-domain.com</string>
</array>
```

> **Nota**: Reemplaza `your-api-domain.com` con el dominio real de tu API (sin https://).

### 2. Variables de Entorno

Configura tus archivos de environment con la información de tu API:

**`src/environments/environment.ts`** (Desarrollo)

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://your-dev-api.com/api',
  apiKey: 'your-development-api-key'
};
```

**`src/environments/environment.prod.ts`** (Producción)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api',
  apiKey: 'your-production-api-key'
};
```

### 3. Obtener CSRF Token desde Cookies

La aplicación necesita extraer el token CSRF de las cookies para enviarlo en las peticiones HTTP que modifican datos.

```typescript
async function getCsrfTokenFromCookie(): Promise<string | null> {
  try {
    // Obtener cookies de la URL específica de la API
    const cookies = await CapacitorCookies.getCookies({
      url: environment.apiUrl
    });
  
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
```

### 4. Configuración del HTTP Interceptor

Configura los interceptores HTTP en `main.ts` para manejar automáticamente:

- API Key en todas las peticiones
- CSRF Token en métodos POST, PUT, PATCH, DELETE
- Credentials para cookies

```typescript
provideHttpClient(
  withInterceptors([
    // Interceptor para asegurar que las cookies se envíen y CSRF token
    (req, next) => {
      // Forzar withCredentials para todas las peticiones a la API
      if (req.url.startsWith(environment.apiUrl)) {
      
        const headers: any = {
          'X-API-Key': environment.apiKey,
          'Accept': 'application/json',
        };

        // Agregar X-CSRF-TOKEN para métodos que lo requieren
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          return from(getCsrfTokenFromCookie()).pipe(
            switchMap(csrfToken => {
              if (csrfToken) {
                headers['X-XSRF-TOKEN'] = csrfToken;
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
```

### 5. Inicializar Cookie CSRF en App Component

En `app.component.ts`, realiza una petición inicial para obtener la cookie CSRF del servidor:

```typescript
ngOnInit(): void {
  firstValueFrom(
    this.http.get(`${environment.apiUrl}/sanctum/csrf-cookie`)
  ).then((response) => {
    console.log('CSRF Cookie inicializada', response);
  }).catch((error) => {
    console.error('Error inicializando CSRF Cookie:', error);
  });
}
```

### 6. Configuración de Capacitor

Configura tu `capacitor.config.ts` para habilitar los plugins necesarios:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.yourapp',
  appName: 'your-app-name',
  webDir: 'www',
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
```

> **Importante**: Los plugins `CapacitorCookies` y `CapacitorHttp` deben estar habilitados para que la autenticación con cookies funcione correctamente.

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Sincronizar capacitor
npx cap sync

# Ejecutar en iOS
npx cap open ios

# Ejecutar en Android
npx cap open android
```

## 📱 Notas Importantes

- **iOS**: Asegúrate de agregar el dominio en `WKAppBoundDomains` para que las cookies funcionen
- **Plugins**: Los plugins `CapacitorCookies` y `CapacitorHttp` deben estar habilitados en la configuración
- **CSRF**: El token CSRF se debe obtener antes de hacer cualquier petición POST/PUT/PATCH/DELETE
- **withCredentials**: Todas las peticiones a la API deben incluir `withCredentials: true` para que las cookies se envíen correctamente

## 🐛 Solución de Problemas

### Las cookies no se guardan

- Verifica que `withCredentials: true` esté configurado en todas las peticiones HTTP
- Revisa la configuración CORS del backend para permitir credenciales
- Asegúrate de que el dominio esté en `WKAppBoundDomains` (iOS)
- Confirma que los plugins `CapacitorCookies` y `CapacitorHttp` estén habilitados

### Error 419 CSRF Token Mismatch

- Verifica que estés llamando `/sanctum/csrf-cookie` antes de hacer login
- Confirma que el header `X-XSRF-TOKEN` se esté enviando correctamente
- Revisa que las cookies se estén guardando y leyendo correctamente con `CapacitorCookies.getCookies()`
- Asegúrate de que el token esté siendo decodificado con `decodeURIComponent()`

### Error de CORS

- Verifica que el backend tenga configurado `supports_credentials: true`
- Confirma que el origin de tu app esté permitido en el backend
- Revisa que los headers `X-API-Key` y `X-XSRF-TOKEN` estén permitidos en el backend
- Verifica que el dominio de la API coincida con el configurado en `environment.apiUrl`

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.
