import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor() {}

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
