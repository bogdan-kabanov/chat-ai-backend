import { Request, Response, NextFunction } from 'express';

const MAX_MESSAGE_LENGTH = 4000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const sanitize = (input: string): string => {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
};

export const validateChatRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { message, conversationId } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Message is required and must be a string.',
    });
    return;
  }

  const sanitized = sanitize(message);

  if (sanitized.length === 0) {
    res.status(400).json({
      success: false,
      error: 'Message cannot be empty.',
    });
    return;
  }

  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({
      success: false,
      error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`,
    });
    return;
  }

  if (conversationId !== undefined && conversationId !== null) {
    if (typeof conversationId !== 'string' || !UUID_REGEX.test(conversationId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid conversation ID format.',
      });
      return;
    }
  }

  req.body.message = sanitized;
  next();
};

export const validateIdParam = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  if (!id || !UUID_REGEX.test(id)) {
    res.status(400).json({
      success: false,
      error: 'Invalid ID format.',
    });
    return;
  }

  next();
};
