import { Router } from 'express';
import pratoRoutes from './prato.routes';
import alimentoRoutes from './alimento.routes';
import usuarioRoutes from './usuario.routes';
import { authMiddleware } from '../middlewares/authMiddleware';
import autorizacaoRoutes from './autorizacao.routes';

// Arquivo indexador das rotas (para organizacao)

const router = Router();

router.use('/pratos', authMiddleware, pratoRoutes);
router.use('/alimentos', authMiddleware, alimentoRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/autorizacoes', autorizacaoRoutes);

export default router;
