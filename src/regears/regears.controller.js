const service = require('./regears.service');

async function create(req, res, next) {
  const newSubmission = await service.create(req.body.data);
  res.status(201).json({ data: newSubmission });
}

async function list(req, res, next) {
  res.json({ data: await service.list() });
}

module.exports = {
  create: [create],
  list: [list],
};
