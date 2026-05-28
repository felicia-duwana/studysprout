import { Router } from 'express';
import { saveSession, getSessions } from '../controllers/session.controller.js';

const router = Router();

router.route('/save').post(saveSession)
router.route('/all').get(getSessions)

export default router;