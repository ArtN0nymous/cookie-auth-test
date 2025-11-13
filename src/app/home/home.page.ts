import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, CommonModule],
})
export class HomePage implements OnInit {

  authStatus: string = 'Verificando...';
  userInfo: User | null = null;
  isLoading: boolean = true;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('🏠 HomePage: ngOnInit iniciado');
    this.checkAuthStatus();
  }

  async checkAuthStatus() {
    console.log('🏠 HomePage: Verificando estado de autenticación...');
    // Primero verificar si tenemos datos del usuario en el storage
    const storedUser = await this.authService.getUser();
    console.log('🏠 HomePage: Usuario almacenado:', storedUser);
    if (storedUser) {
      console.log('🏠 HomePage: Usuario encontrado en storage, configurando datos...');
      this.userInfo = storedUser;
      this.authStatus = 'Usuario autenticado desde storage';
      this.isLoading = false;
      console.log('🏠 HomePage: Usuario configurado desde storage');
    }

    try {
      const response: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/user/profile`));
      console.log('Auth check response:', response);
      this.authStatus = 'Autenticado correctamente';
      const userData = response.user || response.data || response;
      this.userInfo = userData;
      
      // Guardar los datos del usuario en el storage
      if (userData && userData.id) {
        const completeUserData = {
          user: userData,
          message: response.message || 'Profile loaded successfully'
        };
        await this.authService.setUserData(completeUserData);
      }
      
      this.showToast('Autenticación con cookies exitosa');
    } catch (error: any) {
      this.authStatus = 'Error de autenticación';
      this.userInfo = null;
      this.showToast('Error: ' + (error.error?.message || 'No se pudo verificar la autenticación'));
    } finally {
      this.isLoading = false;
    }
  }

  async logout() {
    await this.authService.clearUserData();
    this.router.navigate(['/login']);
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
}