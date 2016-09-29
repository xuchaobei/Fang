import koaRouter from 'koa-router';
import controller from './controller';
import path from 'path';

const router = koaRouter();
router.get('/getVisibleZones', controller.getVisibleZones);
router.get('/searchZones', controller.searchZones);
router.get('/crawler', controller.crawler);

export default router;
