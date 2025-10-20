import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * StorageService - Manejo de almacenamiento local
 * 
 * Servicio que encapsula Ionic Storage para persistir datos locales
 * como tokens de autenticación, información del usuario y configuraciones.
 * 
 * Funcionalidades:
 * - Inicialización automática del storage
 * - Métodos tipados para get/set/remove
 * - Manejo de errores de storage
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  /**
   * Inicializa el storage de Ionic
   * Configura el driver preferido y crea la instancia
   */
  async init() {
    try {
      // Si el storage no está inicializado, lo inicializamos
      if (!this._storage) {
        this._storage = await this.storage.create();
        console.log('💾 StorageService: Storage initialized successfully');
      }
    } catch (error) {
      console.error('💾 StorageService: Error initializing storage:', error);
      // En caso de error, usar localStorage como fallback
      this._storage = this.storage;
    }
  }

  /**
   * Obtiene un valor del storage por clave
   * @param key - Clave del valor a obtener
   * @returns Promise con el valor tipado o null si no existe
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      await this.ensureStorage();
      const value = await this._storage!.get(key);
      return value;
    } catch (error) {
      console.error(`💾 StorageService: Error getting storage key ${key}:`, error);
      return null;
    }
  }

  /**
   * Guarda un valor en el storage
   * @param key - Clave donde guardar el valor
   * @param value - Valor a guardar (debe ser serializable)
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await this.ensureStorage();
      await this._storage!.set(key, value);
    } catch (error) {
      console.error(`💾 StorageService: Error setting storage key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un valor del storage
   * @param key - Clave del valor a eliminar
   */
  async remove(key: string): Promise<void> {
    try {
      await this.ensureStorage();
      await this._storage!.remove(key);
    } catch (error) {
      console.error(`💾 StorageService: Error removing storage key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Elimina todos los valores del storage
   */
  async clear(): Promise<void> {
    try {
      await this.ensureStorage();
      await this._storage!.clear();
    } catch (error) {
      console.error('💾 StorageService: Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las claves almacenadas
   * @returns Array de claves disponibles
   */
  async keys(): Promise<string[]> {
    try {
      await this.ensureStorage();
      return await this._storage!.keys();
    } catch (error) {
      console.error('💾 StorageService: Error getting storage keys:', error);
      return [];
    }
  }

  /**
   * Verifica si el storage está inicializado
   * Si no está inicializado, lo inicializa
   */
  private async ensureStorage(): Promise<void> {
    if (!this._storage) {
      await this.init();
    }
  }

  /**
   * Obtiene el tamaño del storage utilizado
   * @returns Número de entradas almacenadas
   */
  async length(): Promise<number> {
    try {
      await this.ensureStorage();
      return await this._storage!.length();
    } catch (error) {
      console.error('💾 StorageService: Error getting storage length:', error);
      return 0;
    }
  }
}