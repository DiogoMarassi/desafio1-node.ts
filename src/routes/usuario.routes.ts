import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';

const router = Router();
const controller = new UsuarioController();

router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
router.post('/login', (req, res) => controller.login(req, res));

export default router;
