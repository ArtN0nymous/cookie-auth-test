#!/usr/bin/env node

/**
 * Script para configurar iOS para desarrollo HTTP
 * Este script modifica automáticamente el Info.plist para permitir HTTP en desarrollo
 */

const fs = require('fs');
const path = require('path');

const INFO_PLIST_PATH = 'ios/App/App/Info.plist';

// Configuración ATS para desarrollo
const ATS_CONFIG = `
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
        <key>NSExceptionDomains</key>
        <dict>
            <key>192.168.1.139</key>
            <dict>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <true/>
                <key>NSExceptionMinimumTLSVersion</key>
                <string>TLSv1.0</string>
            </dict>
            <key>localhost</key>
            <dict>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <true/>
                <key>NSExceptionMinimumTLSVersion</key>
                <string>TLSv1.0</string>
            </dict>
            <key>127.0.0.1</key>
            <dict>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <true/>
                <key>NSExceptionMinimumTLSVersion</key>
                <string>TLSv1.0</string>
            </dict>
        </dict>
    </dict>`;

function setupDevelopmentMode() {
    console.log('🔧 Configurando iOS para desarrollo HTTP...');
    
    const infoPlistPath = path.resolve(INFO_PLIST_PATH);
    
    if (!fs.existsSync(infoPlistPath)) {
        console.error('❌ No se encontró Info.plist en:', infoPlistPath);
        console.log('💡 Asegúrate de haber ejecutado: npx cap sync ios');
        process.exit(1);
    }
    
    try {
        let content = fs.readFileSync(infoPlistPath, 'utf8');
        
        // Verificar si ya existe la configuración
        if (content.includes('NSAppTransportSecurity')) {
            console.log('⚠️  Ya existe configuración ATS en Info.plist');
            console.log('💡 Si necesitas actualizarla, edita manualmente el archivo');
            return;
        }
        
        // Buscar el cierre de </dict> antes de </plist>
        const plistEndIndex = content.lastIndexOf('</dict>');
        if (plistEndIndex === -1) {
            console.error('❌ No se pudo encontrar el cierre del plist');
            process.exit(1);
        }
        
        // Insertar la configuración ATS antes del cierre
        const beforeEnd = content.substring(0, plistEndIndex);
        const afterEnd = content.substring(plistEndIndex);
        
        const newContent = beforeEnd + ATS_CONFIG + '\n' + afterEnd;
        
        // Crear backup
        const backupPath = infoPlistPath + '.backup';
        fs.writeFileSync(backupPath, content);
        console.log('📁 Backup creado en:', backupPath);
        
        // Escribir el nuevo contenido
        fs.writeFileSync(infoPlistPath, newContent);
        
        console.log('✅ Info.plist configurado para desarrollo HTTP');
        console.log('🚀 Ahora puedes hacer requests HTTP en iOS');
        console.log('💡 Para revertir: cp ios/App/App/Info.plist.backup ios/App/App/Info.plist');
        
    } catch (error) {
        console.error('❌ Error configurando Info.plist:', error.message);
        process.exit(1);
    }
}

function restoreProductionMode() {
    console.log('🔒 Restaurando configuración de producción...');
    
    const infoPlistPath = path.resolve(INFO_PLIST_PATH);
    const backupPath = infoPlistPath + '.backup';
    
    if (!fs.existsSync(backupPath)) {
        console.error('❌ No se encontró backup en:', backupPath);
        console.log('💡 Ejecuta primero: node scripts/setup-dev-ios.js dev');
        process.exit(1);
    }
    
    try {
        fs.copyFileSync(backupPath, infoPlistPath);
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
        console.log('🔧 Script de configuración iOS para desarrollo HTTP');
        console.log('');
        console.log('Uso:');
        console.log('  node scripts/setup-dev-ios.js dev     # Configurar para desarrollo (HTTP)');
        console.log('  node scripts/setup-dev-ios.js prod    # Restaurar para producción (HTTPS)');
        console.log('');
        console.log('Ejemplos:');
        console.log('  npm run ios:dev                        # Configurar y ejecutar en desarrollo');
        console.log('  npm run ios:prod                      # Configurar y ejecutar en producción');
        break;
}

