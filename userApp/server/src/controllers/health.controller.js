import env from '../config/env.js';

export const getHealth = (req, res) => {
  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    runtime: 'vercel-function',
    env: env.NODE_ENV
  });
};
