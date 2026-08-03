import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  
  user$ = this.authService.currentUser$;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  
  isSubmittingProfile = false;
  isSubmittingPassword = false;
  
  profileMessage = '';
  passwordMessage = '';
  passwordError = '';
  
  imageLoadError = false;
  imageRemoved = false;
  serverApiUrl = environment.storageUrl;

  ngOnInit() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password_confirmation: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.user$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
        if (user.image) {
          this.imageLoadError = false;
          this.previewUrl = user.image.startsWith('http') || user.image.startsWith('/')
            ? user.image
            : `/storage/${user.image.replace(/^\//, '')}`;
        } else {
          this.previewUrl = null;
        }
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('new_password')?.value === g.get('new_password_confirmation')?.value
      ? null : { 'mismatch': true };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.profileMessage = 'Please select a valid image file.';
        return;
      }
      this.selectedFile = file;
      this.imageRemoved = false;
      this.imageLoadError = false;
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.imageRemoved = true;
    // Note: To completely delete it from the server, we might need a separate endpoint.
    // Setting previewUrl to null just resets the UI before save.
  }

  onProfileSubmit() {
    if (this.profileForm.invalid) return;
    
    this.isSubmittingProfile = true;
    this.profileMessage = '';
    
    const formData = new FormData();
    formData.append('name', this.profileForm.get('name')?.value);
    formData.append('email', this.profileForm.get('email')?.value);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.imageRemoved) {
      formData.append('remove_image', '1');
    }

    this.authService.updateProfile(formData).subscribe({
      next: () => {
        this.isSubmittingProfile = false;
        this.profileMessage = 'Profile updated successfully!';
        setTimeout(() => this.profileMessage = '', 3000);
      },
      error: () => {
        this.isSubmittingProfile = false;
        this.profileMessage = 'Failed to update profile.';
        setTimeout(() => this.profileMessage = '', 3000);
      }
    });
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid) return;

    this.isSubmittingPassword = true;
    this.passwordMessage = '';
    this.passwordError = '';

    this.authService.updatePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.isSubmittingPassword = false;
        this.passwordMessage = 'Password updated successfully!';
        this.passwordForm.reset();
        setTimeout(() => this.passwordMessage = '', 3000);
      },
      error: (err) => {
        this.isSubmittingPassword = false;
        if (err.error?.errors?.current_password) {
          this.passwordError = err.error.errors.current_password[0];
        } else {
          this.passwordError = err.error?.message || 'Failed to update password.';
        }
      }
    });
  }
}
