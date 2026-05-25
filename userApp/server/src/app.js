import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';

import env from './config/env.js';
import logger from './utils/logger.js';
import rateLimiter from './middlewares/rateLimiter.js';
import apiRouter from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());

const corsOptions = {
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

app.use(compression());

app.use(pinoHttp({
  logger,
  serializers: {
    req: (req) => ({ method: req.method, url: req.originalUrl || req.url }),
    res: (res) => ({ statusCode: res.statusCode })
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.originalUrl || req.url} - ${res.statusCode}`,
  customErrorMessage: (req, res, err) => `${req.method} ${req.originalUrl || req.url} - ${res.statusCode} - ${err.message}`
}));


app.use('/api', rateLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


app.use('/api', apiRouter);

app.use(errorHandler);

export default app;
