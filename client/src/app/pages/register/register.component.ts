import { Component, inject } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  name = '';
  email = '';
  password = '';
  password_confirmation = '';
  errorMessage = '';

  onSubmit() {
    this.errorMessage = '';
    
    if (this.password !== this.password_confirmation) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService.register({ 
      name: this.name, 
      email: this.email, 
      password: this.password,
      password_confirmation: this.password_confirmation
    }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        console.error(err);
      }
    });
  }
}
