import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated() && authService.hasRole('ROLE_ADMIN')) {
    return true;
  }
  
  // Redirect to unauthorized page or home
  router.navigate(['/unauthorized']);
  return false;
};
