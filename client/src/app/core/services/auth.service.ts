import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public isInitialized$ = this.isInitializedSubject.asObservable();
  
  private apiUrl = environment.apiUrl;
  private sanctumUrl = `${environment.apiUrl.replace(/\/api\/?$/, '')}/sanctum/csrf-cookie`;

  constructor() {
    this.initAuth();
  }

  private initAuth() {
    const wasLoggedIn = localStorage.getItem('perojewelry_logged_in') === 'true';
    if (!wasLoggedIn) {
      this.isInitializedSubject.next(true);
      return;
    }
    this.checkAuthStatus().subscribe();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  checkAuthStatus(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/user`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.isInitializedSubject.next(true);
        localStorage.setItem('perojewelry_logged_in', 'true');
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        this.isInitializedSubject.next(true);
        localStorage.removeItem('perojewelry_logged_in');
        return of(null);
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.get(this.sanctumUrl, { withCredentials: true }).pipe(
      switchMap(() => this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true })),
      tap((res: any) => {
        this.currentUserSubject.next(res.user);
        localStorage.setItem('perojewelry_logged_in', 'true');
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.get(this.sanctumUrl, { withCredentials: true }).pipe(
      switchMap(() => this.http.post(`${this.apiUrl}/register`, userData, { withCredentials: true })),
      tap((res: any) => {
        this.currentUserSubject.next(res.user);
        localStorage.setItem('perojewelry_logged_in', 'true');
      })
    );
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/profile`, formData, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res.user) {
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  updatePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/profile/password`, data, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        localStorage.removeItem('perojewelry_logged_in');
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        localStorage.removeItem('perojewelry_logged_in');
        return of(null);
      })
    );
  }
}
