import { Request } from 'express';
import { Cargo } from '../models/Usuario';

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    cargo: Cargo;
    restauranteId: number;
  };
}
