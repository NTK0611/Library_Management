import { Role } from '../constants/role.constant';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      role: Role;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};

