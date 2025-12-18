import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  // ===== MODE =====
  isRegisterMode = false;

  // ===== FORM FIELDS =====
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  message: string = '';

  backendUrl = 'http://localhost:4000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  // ===== SWITCH MODES =====
  switchToRegister() {
    this.isRegisterMode = true;
    this.message = '';
    this.clearPasswords();
  }

  switchToLogin() {
    this.isRegisterMode = false;
    this.message = '';
    this.clearPasswords();
  }

  clearPasswords() {
    this.password = '';
    this.confirmPassword = '';
  }

  // ===== LOGIN (FIXED) =====
  login() {
    if (!this.email || !this.password) {
      this.message = 'Email and password are required';
      return;
    }

    this.http
      .post(`${this.backendUrl}/login`, {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res: any) => {
          // ✅ SAVE TOKEN
          localStorage.setItem('token', res.token);

          // ✅ SAVE USER OBJECT (IMPORTANT)
          localStorage.setItem('user', JSON.stringify(res.user));

          // ✅ GO TO DASHBOARD
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.message = err.error?.error || 'Login failed';
        },
      });
  }

  // ===== REGISTER =====
  register() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.message = 'All fields are required';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match';
      return;
    }

    this.http
      .post(`${this.backendUrl}/register`, {
        name: this.name,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.message = 'Registration successful. Please login.';
          this.isRegisterMode = false;
          this.clearPasswords();
        },
        error: (err) => {
          this.message = err.error?.error || 'Registration failed';
        },
      });
  }
}
