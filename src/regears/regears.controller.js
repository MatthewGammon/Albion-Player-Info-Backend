const service = require('./regears.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

async function regearExists(req, res, next) {
  const { event_id } = req.body.data;
  const regear = await service.read(event_id);
  if (regear) {
    next({
      status: 400,
      message: `A regear submission for this death already exists!`,
    });
  }
  next();
}

async function create(req, res, next) {
  const newSubmission = await service.create(req.body.data);
  res.status(201).json({ data: newSubmission });
}

async function list(req, res, next) {
  res.json({ data: await service.list() });
}

module.exports = {
  create: [asyncErrorBoundary(regearExists), asyncErrorBoundary(create)],
  list: [asyncErrorBoundary(list)],
};
