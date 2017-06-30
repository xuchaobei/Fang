import koa from 'koa';
import serve from 'koa-static';
import webpackMiddleware from 'koa-webpack-dev-middleware';
import webpackHotMiddleware from 'koa-webpack-hot-middleware';
import webpack from 'webpack';
import path from 'path';
import koaRouter from 'koa-router';
import fs from 'fs';
import mongoose from 'mongoose';
import api from './api';

function startWebServer(port) {
  const app = koa();

  if (process.env.NODE_ENV === 'development') {
    app.use(serve(path.join(__dirname, '../frontend')));

    const webpackDevConfig = require('../configs/webpack.client.koa-watch');
    const compiler = webpack(webpackDevConfig);
    app.use(
      webpackMiddleware(compiler, {
        noInfo: true,
        publicPath: webpackDevConfig.output.publicPath,
      })
    );

    app.use(webpackHotMiddleware(compiler));
  } else {
    app.use(serve(path.join(__dirname, '../static')));
  }

  const router = koaRouter();

  router.all('/mockdata/:service', function mockService() {
    const filePath = 'mockdata/' + this.params.service + '.json';
    try {
      this.body = fs.readFileSync(path.join(__dirname, '../' + filePath));
      this.type = 'application/json';
    } catch (e) {
      console.error(e);
      this.status = 404;
    }
  });

  app.use(router.routes());
  app.use(api.routes());

  app.on('error', err => {
    console.log('error', err);
  });

  app.listen(port);
}

mongoose.connect('mongodb://localhost:27017/map');
startWebServer(8080);
