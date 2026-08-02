import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, switchMap, take } from 'rxjs/operators';

export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isInitialized$.pipe(
      filter(initialized => initialized),
      switchMap(() => authService.currentUser$),
      take(1),
      map(user => {
        if (!user) {
          return true;
        }
        router.navigate(['/']);
        return false;
      })
    );
};
