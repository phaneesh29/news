import {Router} from 'express';
import AppError from '../utils/appError.js';
import healthRouter from './health.route.js';
import newsRouter from './news.route.js';
import blogRouter from './blog.route.js';

const router = Router();


router.use('/health', healthRouter);
router.use('/news', newsRouter);
router.use('/blogs', blogRouter);

router.all('*any', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

export default router;
