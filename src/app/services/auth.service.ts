import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

export interface User {
  id: number;
  name: string;
  email: string;
  [key: string]: any;
}

export interface CompleteUserData {
  user: User;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.authSubject.asObservable();

  public get isAuthenticated(): boolean {
    return this.authSubject.value;
  }

  constructor(private storageService: StorageService) {
    this.loadAuthStateFromStorage();
  }

  /**
   * Carga el estado de autenticación desde el storage
   */
  private async loadAuthStateFromStorage(): Promise<void> {
    try {
      const userData = await this.getCompleteUserData();
      if (userData) {
        this.updateAuthStateFromCompleteData(userData);
      }
    } catch (error) {
      console.error('🔐 AuthService: Error loading auth state:', error);
    }
  }

  /**
   * Obtiene los datos completos del usuario desde el almacenamiento local
   * @returns Promise con los datos completos del usuario o null
   */
  async getCompleteUserData(): Promise<CompleteUserData | null> {
    try {
      console.log('🔐 AuthService: Obteniendo datos completos del usuario...');
      const userData = await this.storageService.get<CompleteUserData>('user');
      console.log('🔐 AuthService: Datos obtenidos:', userData);
      return userData;
    } catch (error) {
      console.error('🔐 AuthService: Error getting complete user data:', error);
      return null;
    }
  }

  /**
   * Actualiza el estado de autenticación con datos completos
   * @param completeData - Datos completos del usuario
   */
  updateAuthStateFromCompleteData(completeData: CompleteUserData): void {
    console.log('🔐 AuthService: Actualizando estado de autenticación con:', completeData);
    this.authSubject.next(true);
  }

  /**
   * Guarda los datos del usuario en el storage
   * @param userData - Datos del usuario a guardar
   */
  async setUserData(userData: CompleteUserData): Promise<void> {
    try {
      console.log('🔐 AuthService: Guardando datos del usuario:', userData);
      await this.storageService.set('user', userData);
      this.updateAuthStateFromCompleteData(userData);
      console.log('🔐 AuthService: Datos del usuario guardados exitosamente');
    } catch (error) {
      console.error('🔐 AuthService: Error saving user data:', error);
      throw error;
    }
  }

  /**
   * Limpia los datos del usuario y actualiza el estado
   */
  async clearUserData(): Promise<void> {
    try {
      console.log('🔐 AuthService: Limpiando datos del usuario...');
      await this.storageService.remove('user');
      this.authSubject.next(false);
      console.log('🔐 AuthService: Datos del usuario limpiados');
    } catch (error) {
      console.error('🔐 AuthService: Error clearing user data:', error);
      throw error;
    }
  }

  /**
   * Obtiene solo los datos del usuario (sin el wrapper)
   */
  async getUser(): Promise<User | null> {
    try {
      const completeData = await this.getCompleteUserData();
      return completeData?.user || null;
    } catch (error) {
      console.error('🔐 AuthService: Error getting user:', error);
      return null;
    }
  }
}
