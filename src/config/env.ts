import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()),
  nodeEnv: process.env.NODE_ENV || 'development',
};
