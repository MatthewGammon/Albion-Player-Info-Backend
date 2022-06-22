const router = require('express').Router();
const controller = require('../generateRegearRequest/generateRegearRequest.controller');
const methodNotAllowed = require('../errors/methodNotAllowed');

router.route('/').post(controller.create).all(methodNotAllowed);

module.exports = router;
