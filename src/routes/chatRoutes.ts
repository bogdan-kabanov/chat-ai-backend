import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { validateChatRequest, validateIdParam } from '../middlewares/validateRequest';

const router = Router();

router.post('/send', validateChatRequest, chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', validateIdParam, chatController.getConversation);
router.delete('/conversations/:id', validateIdParam, chatController.deleteConversation);

export default router;
