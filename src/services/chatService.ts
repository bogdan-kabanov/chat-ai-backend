import OpenAI from 'openai';
import { config } from '../config/env';
import prisma from '../config/prisma';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
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

    // Save user message
    await prisma.message.create({
      data: {
        role: 'user',
        content: message,
        conversationId: conversation.id,
      },
    });

    // Build messages history for context
    const history: ChatMessage[] = conversation.messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    history.push({ role: 'user', content: message });

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Respond concisely and clearly.',
          },
          ...history,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || 'No response received';

      // Save assistant message
      await prisma.message.create({
        data: {
          role: 'assistant',
          content: reply,
          conversationId: conversation.id,
        },
      });

      return { reply, conversationId: conversation.id };
    } catch (error: any) {
      if (error?.status === 401) {
        throw Object.assign(new Error('Invalid OpenAI API key'), { statusCode: 401 });
      }
      if (error?.status === 429) {
        throw Object.assign(new Error('Rate limit exceeded. Please try again later.'), {
          statusCode: 429,
        });
      }
      throw Object.assign(
        new Error(error?.message || 'Failed to get response from ChatGPT'),
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
