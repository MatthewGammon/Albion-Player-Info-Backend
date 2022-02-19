const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const regearsRouter = require('./regears/regears.router');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/regears', regearsRouter);

module.exports = app;
