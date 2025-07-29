import { Router } from 'express';
import { AlimentoController } from '../controllers/AlimentoController';

const router = Router();
const controller = new AlimentoController();

router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.softDelete.bind(controller));

export default router;
