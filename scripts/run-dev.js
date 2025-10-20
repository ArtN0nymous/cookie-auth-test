#!/usr/bin/env node

/**
 * Script para ejecutar con configuración de desarrollo HTTP
 * Este script configura la plataforma para HTTP y luego ejecuta
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PLATFORMS = {
    ios: {
        setupScript: 'scripts/setup-dev-ios.js',
        runCommand: 'ionic cap run ios',
        name: 'iOS'
    },
    android: {
        setupScript: 'scripts/setup-dev-android.js',
        runCommand: 'ionic cap run android',
        name: 'Android'
    }
};

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : '🔧';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

function runCommand(command, description) {
    try {
        log(`Ejecutando: ${description}`);
        execSync(command, { stdio: 'inherit' });
        log(`${description} completado`, 'success');
        return true;
    } catch (error) {
        log(`Error en ${description}: ${error.message}`, 'error');
        return false;
    }
}

function runForDevelopment(platform) {
    const config = PLATFORMS[platform];
    
    if (!config) {
        log(`Plataforma no soportada: ${platform}`, 'error');
        log('Plataformas soportadas: ios, android', 'warn');
        process.exit(1);
    }
    
    log(`🚀 Iniciando ejecución de desarrollo para ${config.name}...`);
    
    // Paso 1: Configurar para desarrollo
    log(`📱 Configurando ${config.name} para desarrollo HTTP...`);
    if (!runCommand(`node ${config.setupScript} dev`, `Configuración de desarrollo ${config.name}`)) {
        log(`❌ Error configurando ${config.name} para desarrollo`, 'error');
        process.exit(1);
    }
    
    // Paso 2: Compilar la aplicación web
    log('🌐 Compilando aplicación web...');
    if (!runCommand('ng build', 'Compilación de Angular')) {
        log('❌ Error compilando aplicación web', 'error');
        process.exit(1);
    }
    
    // Paso 3: Sincronizar con Capacitor
    log(`🔄 Sincronizando con ${config.name}...`);
    if (!runCommand(`ionic cap sync ${platform}`, `Sincronización ${config.name}`)) {
        log(`❌ Error sincronizando con ${config.name}`, 'error');
        process.exit(1);
    }
    
    // Paso 4: Ejecutar la aplicación
    log(`📱 Ejecutando aplicación ${config.name}...`);
    if (!runCommand(config.runCommand, `Ejecución ${config.name}`)) {
        log(`❌ Error ejecutando aplicación ${config.name}`, 'error');
        process.exit(1);
    }
    
    log(`🎉 Ejecución de desarrollo completada para ${config.name}!`, 'success');
    log(`📱 La aplicación está configurada para HTTP y ejecutándose`, 'success');
}

function runForProduction(platform) {
    const config = PLATFORMS[platform];
    
    if (!config) {
        log(`Plataforma no soportada: ${platform}`, 'error');
        log('Plataformas soportadas: ios, android', 'warn');
        process.exit(1);
    }
    
    log(`🚀 Iniciando ejecución de producción para ${config.name}...`);
    
    // Paso 1: Configurar para producción
    log(`📱 Configurando ${config.name} para producción HTTPS...`);
    if (!runCommand(`node ${config.setupScript} prod`, `Configuración de producción ${config.name}`)) {
        log(`❌ Error configurando ${config.name} para producción`, 'error');
        process.exit(1);
    }
    
    // Paso 2: Compilar la aplicación web
    log('🌐 Compilando aplicación web...');
    if (!runCommand('ng build --configuration production', 'Compilación de Angular (producción)')) {
        log('❌ Error compilando aplicación web', 'error');
        process.exit(1);
    }
    
    // Paso 3: Sincronizar con Capacitor
    log(`🔄 Sincronizando con ${config.name}...`);
    if (!runCommand(`ionic cap sync ${platform}`, `Sincronización ${config.name}`)) {
        log(`❌ Error sincronizando con ${config.name}`, 'error');
        process.exit(1);
    }
    
    // Paso 4: Ejecutar la aplicación
    log(`📱 Ejecutando aplicación ${config.name}...`);
    if (!runCommand(config.runCommand, `Ejecución ${config.name}`)) {
        log(`❌ Error ejecutando aplicación ${config.name}`, 'error');
        process.exit(1);
    }
    
    log(`🎉 Ejecución de producción completada para ${config.name}!`, 'success');
    log(`🔒 La aplicación está configurada para HTTPS y ejecutándose`, 'success');
}

function showHelp() {
    console.log('🔧 Script de ejecución con configuración automática');
    console.log('');
    console.log('Uso:');
    console.log('  node scripts/run-dev.js <plataforma> <modo>');
    console.log('');
    console.log('Plataformas:');
    console.log('  ios       - Ejecutar para iOS');
    console.log('  android   - Ejecutar para Android');
    console.log('');
    console.log('Modos:');
    console.log('  dev       - Configuración de desarrollo (HTTP)');
    console.log('  prod      - Configuración de producción (HTTPS)');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node scripts/run-dev.js ios dev      # iOS para desarrollo');
    console.log('  node scripts/run-dev.js android prod # Android para producción');
    console.log('');
    console.log('Comandos npm:');
    console.log('  npm run run:dev:ios       # iOS para desarrollo');
    console.log('  npm run run:dev:android  # Android para desarrollo');
    console.log('  npm run run:prod:ios     # iOS para producción');
    console.log('  npm run run:prod:android # Android para producción');
}

// Verificar argumentos
const platform = process.argv[2];
const mode = process.argv[3];

if (!platform || !mode) {
    showHelp();
    process.exit(1);
}

if (!['ios', 'android'].includes(platform)) {
    log(`Plataforma no válida: ${platform}`, 'error');
    log('Plataformas válidas: ios, android', 'warn');
    process.exit(1);
}

if (!['dev', 'prod'].includes(mode)) {
    log(`Modo no válido: ${mode}`, 'error');
    log('Modos válidos: dev, prod', 'warn');
    process.exit(1);
}

// Ejecutar aplicación
if (mode === 'dev') {
    runForDevelopment(platform);
} else {
    runForProduction(platform);
}
