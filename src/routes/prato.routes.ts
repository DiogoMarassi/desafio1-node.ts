import { Router } from 'express';
import { PratoController } from '../controllers/PratoController';

const router = Router();
const controller = new PratoController();

router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.softDelete.bind(controller));

export default router;
