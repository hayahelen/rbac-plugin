import { AuthUser } from 'src/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
