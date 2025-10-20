#!/usr/bin/env node

/**
 * Script para configurar Android para desarrollo HTTP
 * Este script modifica automáticamente el AndroidManifest.xml para permitir HTTP en desarrollo
 */

const fs = require('fs');
const path = require('path');

const ANDROID_MANIFEST_PATH = 'android/app/src/main/AndroidManifest.xml';

function setupDevelopmentMode() {
    console.log('🔧 Configurando Android para desarrollo HTTP...');
    
    const manifestPath = path.resolve(ANDROID_MANIFEST_PATH);
    
    if (!fs.existsSync(manifestPath)) {
        console.error('❌ No se encontró AndroidManifest.xml en:', manifestPath);
        console.log('💡 Asegúrate de haber ejecutado: npx cap sync android');
        process.exit(1);
    }
    
    try {
        let content = fs.readFileSync(manifestPath, 'utf8');
        
        // Verificar si ya existe la configuración
        if (content.includes('android:usesCleartextTraffic="true"')) {
            console.log('⚠️  Ya existe configuración de cleartext traffic en AndroidManifest.xml');
            return;
        }
        
        // Buscar la etiqueta <application
        const applicationIndex = content.indexOf('<application');
        if (applicationIndex === -1) {
            console.error('❌ No se pudo encontrar la etiqueta <application');
            process.exit(1);
        }
        
        // Buscar el cierre de la etiqueta application
        const applicationEndIndex = content.indexOf('>', applicationIndex);
        if (applicationEndIndex === -1) {
            console.error('❌ No se pudo encontrar el cierre de la etiqueta <application');
            process.exit(1);
        }
        
        // Insertar la configuración antes del cierre
        const beforeEnd = content.substring(0, applicationEndIndex);
        const afterEnd = content.substring(applicationEndIndex);
        
        const newContent = beforeEnd + ' android:usesCleartextTraffic="true"' + afterEnd;
        
        // Crear backup
        const backupPath = manifestPath + '.backup';
        fs.writeFileSync(backupPath, content);
        console.log('📁 Backup creado en:', backupPath);
        
        // Escribir el nuevo contenido
        fs.writeFileSync(manifestPath, newContent);
        
        console.log('✅ AndroidManifest.xml configurado para desarrollo HTTP');
        console.log('🚀 Ahora puedes hacer requests HTTP en Android');
        console.log('💡 Para revertir: cp android/app/src/main/AndroidManifest.xml.backup android/app/src/main/AndroidManifest.xml');
        
    } catch (error) {
        console.error('❌ Error configurando AndroidManifest.xml:', error.message);
        process.exit(1);
    }
}

function restoreProductionMode() {
    console.log('🔒 Restaurando configuración de producción...');
    
    const manifestPath = path.resolve(ANDROID_MANIFEST_PATH);
    const backupPath = manifestPath + '.backup';
    
    if (!fs.existsSync(backupPath)) {
        console.error('❌ No se encontró backup en:', backupPath);
        console.log('💡 Ejecuta primero: node scripts/setup-dev-android.js dev');
        process.exit(1);
    }
    
    try {
        fs.copyFileSync(backupPath, manifestPath);
        console.log('✅ Configuración de producción restaurada');
        console.log('🔒 Ahora solo se permiten conexiones HTTPS');
    } catch (error) {
        console.error('❌ Error restaurando backup:', error.message);
        process.exit(1);
    }
}

// Verificar argumentos
const command = process.argv[2];

switch (command) {
    case 'dev':
    case 'development':
        setupDevelopmentMode();
        break;
    case 'prod':
    case 'production':
        restoreProductionMode();
        break;
    default:
        console.log('🔧 Script de configuración Android para desarrollo HTTP');
        console.log('');
        console.log('Uso:');
        console.log('  node scripts/setup-dev-android.js dev     # Configurar para desarrollo (HTTP)');
        console.log('  node scripts/setup-dev-android.js prod    # Restaurar para producción (HTTPS)');
        console.log('');
        console.log('Ejemplos:');
        console.log('  npm run android:dev                        # Configurar y ejecutar en desarrollo');
        console.log('  npm run android:prod                      # Configurar y ejecutar en producción');
        break;
}

