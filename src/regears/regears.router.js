const router = require('express').Router();
const controller = require('./regears.controller');

router.route('/').get(controller.list).post(controller.create);

module.exports = router;
