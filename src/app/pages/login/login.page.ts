import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonItem, IonLabel } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService, CompleteUserData } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonInput, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, FormsModule],
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  async login() {
    if (!this.email || !this.password) {
      this.showToast('Por favor completa todos los campos');
      return;
    }

    this.isLoading = true;
    
    try {
      const response: any = await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/login`, {
        email: this.email,
        password: this.password
      }, {withCredentials: true}));
      console.log('Login response:', response);

      // Guardar información del usuario usando el AuthService
      const completeUserData: CompleteUserData = {
        user: response.user || response.data?.user || response.data || response,
        message: response.message || 'Login successful'
      };
      
      console.log('🔑 LoginPage: Datos completos del usuario creados:', completeUserData);
      await this.authService.setUserData(completeUserData);
      console.log('🔑 LoginPage: Usuario guardado exitosamente');
      
      this.showToast('Login exitoso');
      console.log('🔑 LoginPage: Navegando a home...');
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error en login:', error);
      this.showToast('Error en el login: ' + (error.error?.message || 'Error desconocido'));
    } finally {
      this.isLoading = false;
    }
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
