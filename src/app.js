const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const errorHandler = require('./errors/errorHandler');
const notFound = require('./errors/notFound');
const regearsRouter = require('./regears/regears.router');
const generateRegearRequestRouter = require('./generateRegearRequest/generateRegearRequest.router');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/regears', regearsRouter);
app.use('/generateRegearRequest', generateRegearRequestRouter);
app.use(
  '/',
  createProxyMiddleware({
    target: 'https://gameinfo.albiononline.com/api/gameinfo',
    changeOrigin: true,
  })
);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
