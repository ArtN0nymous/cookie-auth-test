import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { environment } from 'src/environments/environment.prod';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private http: HttpClient) {
    console.log('🚀 AppComponent: Constructor iniciado');
  }
  ngOnInit(): void {
    console.log('🚀 AppComponent: ngOnInit iniciado');
    firstValueFrom(this.http.get(`${environment.apiUrl}/sanctum/csrf-cookie`)).then((response) => {
      console.log('🚀 AppComponent: CSRF cookie obtenida:', response);
    }).catch((error) => {
      console.error('🚀 AppComponent: Error obteniendo CSRF cookie:', error);
    });
  }
}
