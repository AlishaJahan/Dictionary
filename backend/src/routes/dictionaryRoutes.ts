import { Router } from 'express';
import { DictionaryController } from '../controllers/dictionaryController';

const router = Router();

// Routes mapping
router.get('/search', DictionaryController.search);
router.get('/suggest', DictionaryController.suggest);

export default router;
