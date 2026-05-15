import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chatService';

export class ChatController {
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, conversationId } = req.body;
      const result = await chatService.sendMessage(message, conversationId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConversations(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversations = await chatService.getConversations();

      res.json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const conversation = await chatService.getConversation(id);

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await chatService.deleteConversation(id);

      res.json({
        success: true,
        message: 'Conversation deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
