import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { AuthResponse } from '../types/auth-response.mode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  router = inject(Router);
  httpClient = inject(HttpClient);

  public isLogin(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      return true;
    } else {
      this.router.navigateByUrl('/login');
      return false;
    }
  }

  public auth(user: any) {
    return this.httpClient.post<AuthResponse>(
      `${environment.baseUrl}/auth/login`,
      user
    );
  }
}
