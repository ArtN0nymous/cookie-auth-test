# 🔧 Configuración de Desarrollo HTTP

Este proyecto incluye scripts automatizados para configurar iOS y Android para permitir requests HTTP durante el desarrollo.

## 🚀 Comandos Disponibles

### **Ejecutar en Dispositivo/Simulador**
```bash
# iOS - Desarrollo (HTTP)
npm run ios:dev

# iOS - Producción (HTTPS)
npm run ios:prod

# Android - Desarrollo (HTTP)
npm run android:dev

# Android - Producción (HTTPS)
npm run android:prod
```

### **Compilar Aplicación**
```bash
# iOS - Desarrollo (HTTP)
npm run build:dev:ios

# iOS - Producción (HTTPS)
npm run build:prod:ios

# Android - Desarrollo (HTTP)
npm run build:dev:android

# Android - Producción (HTTPS)
npm run build:prod:android
```

### **Solo Configurar (Sin Ejecutar)**
```bash
# iOS
npm run ios:setup:dev
npm run ios:setup:prod

# Android
npm run android:setup:dev
npm run android:setup:prod
```

### **Sincronización**
```bash
# Sincronizar ambos
npm run sync

# Sincronizar solo iOS
npm run sync:ios

# Sincronizar solo Android
npm run sync:android
```

## 🔍 ¿Qué Hacen los Scripts?

### **iOS (Info.plist)**
- **Desarrollo**: Permite HTTP en `192.168.1.139`, `localhost`, `127.0.0.1`
- **Producción**: Solo permite HTTPS (configuración segura)

### **Android (AndroidManifest.xml)**
- **Desarrollo**: Habilita `android:usesCleartextTraffic="true"`
- **Producción**: Deshabilita cleartext traffic (solo HTTPS)

## 📁 Archivos Modificados

### **iOS**
- `ios/App/App/Info.plist` - Configuración ATS
- `ios/App/App/Info.plist.backup` - Backup automático

### **Android**
- `android/app/src/main/AndroidManifest.xml` - Configuración de red
- `android/app/src/main/AndroidManifest.xml.backup` - Backup automático

## 🔄 Flujo de Trabajo

### **Para Desarrollo:**
1. `npm run ios:dev` - Configura y ejecuta iOS con HTTP
2. `npm run android:dev` - Configura y ejecuta Android con HTTP
3. `npm run build:dev:ios` - Configura y compila iOS con HTTP
4. `npm run build:dev:android` - Configura y compila Android con HTTP

### **Para Producción:**
1. `npm run ios:prod` - Configura y ejecuta iOS con HTTPS
2. `npm run android:prod` - Configura y ejecuta Android con HTTPS
3. `npm run build:prod:ios` - Configura y compila iOS con HTTPS
4. `npm run build:prod:android` - Configura y compila Android con HTTPS

## 📱 Compilación vs Ejecución

### **Ejecutar (Run):**
- **Propósito**: Desarrollo y testing
- **Resultado**: Aplicación ejecutándose en simulador/dispositivo
- **Uso**: `npm run ios:dev`, `npm run android:dev`

### **Compilar (Build):**
- **Propósito**: Crear archivos de distribución
- **Resultado**: Archivos compilados listos para distribución
- **Uso**: `npm run build:dev:ios`, `npm run build:prod:android`

## ⚠️ Importante

- **Solo para desarrollo** - Los scripts de desarrollo permiten HTTP
- **Producción segura** - Los scripts de producción solo permiten HTTPS
- **Backups automáticos** - Se crean backups antes de modificar archivos
- **Reversible** - Siempre puedes restaurar la configuración original

## 🛠️ Solución de Problemas

### **Si no funciona:**
1. Verificar que `npx cap sync` se haya ejecutado
2. Verificar que los archivos existan en las rutas esperadas
3. Ejecutar manualmente: `node scripts/setup-dev-ios.js dev`

### **Para restaurar manualmente:**
```bash
# iOS
cp ios/App/App/Info.plist.backup ios/App/App/Info.plist

# Android  
cp android/app/src/main/AndroidManifest.xml.backup android/app/src/main/AndroidManifest.xml
```

## 🎯 Beneficios

- ✅ **Automatizado** - No necesitas editar archivos manualmente
- ✅ **Seguro** - Configuración diferente para desarrollo y producción
- ✅ **Reversible** - Siempre puedes volver a la configuración original
- ✅ **Backup** - Se crean backups automáticamente
- ✅ **Fácil** - Un solo comando para configurar y ejecutar
