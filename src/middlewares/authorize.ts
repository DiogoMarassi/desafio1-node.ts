import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { Cargo } from '../models/Usuario';

export function authorize(cargosPermitidos: Cargo[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { cargo } = (req as AuthenticatedRequest).user;

    if (!cargosPermitidos.includes(cargo)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    next();
  };
}
