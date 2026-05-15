import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import prisma from '../config/prisma';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export class ChatService {
  async sendMessage(
    message: string,
    conversationId?: string
  ): Promise<{ reply: string; conversationId: string }> {
    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: message.substring(0, 50),
        },
        include: { messages: true },
      });
    }

    await prisma.message.create({
      data: {
        role: 'user',
        content: message,
        conversationId: conversation.id,
      },
    });

    const history: ChatMessage[] = conversation.messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    try {
      const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let reply = '';

      let lastError: any = null;

      for (const modelName of models) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });

          const chat = model.startChat({
            history,
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7,
            },
          });

          const result = await chat.sendMessage(message);
          const response = result.response;
          reply = response.text() || '';

          if (reply) {
            console.log(`Successfully used model: ${modelName}`);
            break;
          }
        } catch (modelError: any) {
          lastError = modelError;
          console.warn(`Model ${modelName} failed: ${modelError?.message || modelError}. Trying next...`);
          continue;
        }
      }

      if (!reply && lastError) {
        throw lastError;
      }

      if (!reply) {
        throw new Error('All models failed to respond. Please try again later.');
      }

      await prisma.message.create({
        data: {
          role: 'assistant',
          content: reply,
          conversationId: conversation.id,
        },
      });

      return { reply, conversationId: conversation.id };
    } catch (error: any) {
      console.error('Gemini API error:', error?.message || error);

      if (error?.message?.includes('API_KEY_INVALID') || error?.status === 400) {
        throw Object.assign(new Error('Invalid Gemini API key'), { statusCode: 401 });
      }
      if (error?.message?.includes('RATE_LIMIT') || error?.status === 429) {
        throw Object.assign(new Error('Rate limit exceeded. Please try again later.'), {
          statusCode: 429,
        });
      }
      if (error?.status === 503 || error?.message?.includes('503')) {
        throw Object.assign(new Error('All models are currently overloaded. Please try again in a minute.'), {
          statusCode: 503,
        });
      }
      throw Object.assign(
        new Error(error?.message || 'Failed to get response from AI'),
        { statusCode: 502 }
      );
    }
  }

  async getConversations() {
    return prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getConversation(id: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
    }

    return conversation;
  }

  async deleteConversation(id: string) {
    await prisma.conversation.delete({
      where: { id },
    });
  }
}

export const chatService = new ChatService();
