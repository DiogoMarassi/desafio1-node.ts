import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new UsuarioController();

router.post('/:id/pratos', authMiddleware, controller.associarPratos.bind(controller));
router.delete('/:id/pratos', authMiddleware, controller.desassociarPratos.bind(controller));
router.get('/', authMiddleware, controller.getAll.bind(controller));
router.get('/:id', authMiddleware, controller.getById.bind(controller));
router.post('/', authMiddleware, controller.create.bind(controller));
router.put('/:id', authMiddleware, controller.update.bind(controller));
router.delete('/:id', authMiddleware, controller.delete.bind(controller));
router.post('/login', (req, res) => controller.login(req, res));


export default router;
