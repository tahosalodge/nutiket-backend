import { Router } from 'express';
import { catchErrors } from '../../utils/errors';
import * as controller from './controller';

const router = Router();

router.post('/', catchErrors(controller.create));
router.get('/', catchErrors(controller.list));
router.get('/:lodgeId', catchErrors(controller.get));
router.patch('/:lodgeId', catchErrors(controller.update));
router.delete('/:lodgeId', catchErrors(controller.remove));

export default router;
