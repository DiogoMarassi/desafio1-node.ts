import { Router } from 'express';
import pratoRoutes from './prato.routes';
import alimentoRoutes from './alimento.routes';
import usuarioRoutes from './usuario.routes';
import { authMiddleware } from '../middlewares/authMiddleware';

// Arquivo indexador das rotas (para organizacao)

const router = Router();

router.use('/pratos', authMiddleware, pratoRoutes);
router.use('/alimentos', authMiddleware, alimentoRoutes);
router.use('/usuarios', authMiddleware, usuarioRoutes);

export default router;
