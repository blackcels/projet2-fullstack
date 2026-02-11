import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AuthRequest, AuthResponse } from '../../core/service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  submitted = false;
  loading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const authRequest: AuthRequest = {
      login: this.form['login'].value || '',
      password: this.form['password'].value || '',
    };

    this.authService.login(authRequest).subscribe({
      next: (response: AuthResponse) => {
        this.loading = false;
        this.authService.setToken(response.token); // use setToken so service and interceptor are consistent
        this.router.navigateByUrl('/students');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Échec de la connexion';
      }
    });
  }

  onReset(): void {
    this.submitted = false;
    this.loginForm.reset();
    this.errorMessage = null;
  }
}
