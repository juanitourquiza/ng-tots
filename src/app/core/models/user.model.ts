export interface User {
  id: number;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  token?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string; // Cambiado de email a username para coincidir con lo que espera el backend
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
