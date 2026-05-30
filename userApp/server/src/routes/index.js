import {Router} from 'express';
import AppError from '../utils/appError.js';
import healthRouter from './health.route.js';

const router = Router();


router.use('/health', healthRouter);

router.all('*any', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

export default router;
