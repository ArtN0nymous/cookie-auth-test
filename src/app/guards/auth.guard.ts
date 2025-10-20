import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard - Guard funcional para rutas protegidas
 * 
 * Guard que protege rutas que requieren autenticación.
 * Verifica si el usuario tiene datos guardados en el storage.
 * 
 * Lógica:
 * - Si tiene datos del usuario: permite acceso
 * - Si no tiene datos: redirige a login
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const navController = inject(NavController);

  try {
    console.log('🔐 AuthGuard: Iniciando verificación de autenticación');
    
    // Verificar si hay datos del usuario en el storage
    const completeUserData = await authService.getCompleteUserData();
    console.log('🔐 AuthGuard: Datos del usuario obtenidos:', completeUserData);
    
    if (completeUserData) {
      // Si el estado de autenticación no está actualizado, actualizarlo
      if (!authService.isAuthenticated) {
        console.log('🔐 AuthGuard: Actualizando estado de autenticación');
        authService.updateAuthStateFromCompleteData(completeUserData);
      }
      
      console.log('🔐 AuthGuard: Usuario autenticado, permitiendo acceso');
      return true;
    } else {
      // Si no hay datos, el usuario no está autenticado
      console.log('🔐 AuthGuard: Usuario no autenticado, redirigiendo a login');
      navController.navigateRoot('/login');
      return false;
    }
  } catch (error) {
    console.error('🔐 AuthGuard: Error en verificación:', error);
    navController.navigateRoot('/login');
    return false;
  }
};