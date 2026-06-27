import { Router } from 'express';
import { saveSession, getSessions, getSelectedFlower } from '../controllers/session.controller.js';

const router = Router();

router.route('/flower').get(getSelectedFlower)
router.route('/save').post(saveSession)
router.route('/all').get(getSessions)

export default router;