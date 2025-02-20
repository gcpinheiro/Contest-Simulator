import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  loginForm!: FormGroup;
  loadingButton: boolean = false;
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }


  login() {
    console.log("Chamou")
    this.loadingButton = true;
    this.authService.auth(this.loginForm.value).subscribe({
      next: (data: any) => {
        localStorage.setItem('token', data.access_token);

        this.loadingButton = false;
        this.router.navigate(['/'])
      },
      error: (err: any) => {
        this.loadingButton = false;
      },
    });
  }
}
