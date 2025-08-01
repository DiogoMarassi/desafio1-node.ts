import { Router } from 'express';
import { AutorizacaoController } from '../controllers/AutorizacaoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new AutorizacaoController();

router.get('/pratos-pelo-token', authMiddleware, (controller.getByUsuarioToken.bind(controller)));
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.get('/usuario/:id', controller.getByUsuario.bind(controller));
router.post('/verifica-acesso', controller.verificarAcesso.bind(controller));
router.get('/usuario/:id/admin', controller.verificarAdmin.bind(controller));
export default router;
