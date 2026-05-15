import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { validateChatRequest } from '../middlewares/validateRequest';

const router = Router();

router.post('/send', validateChatRequest, chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversation);
router.delete('/conversations/:id', chatController.deleteConversation);

export default router;
