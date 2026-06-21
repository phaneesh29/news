import {Router} from 'express';
import AppError from '../utils/appError.js';
import healthRouter from './health.route.js';
import newsRouter from './news.route.js';
import blogRouter from './blog.route.js';
import feedbackRouter from './feedback.route.js';
import digestRouter from './digest.route.js';

const router = Router();


router.use('/health', healthRouter);
router.use('/news', newsRouter);
router.use('/blogs', blogRouter);
router.use('/feedbacks', feedbackRouter);
router.use('/digest', digestRouter);

router.all('*any', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

export default router;
