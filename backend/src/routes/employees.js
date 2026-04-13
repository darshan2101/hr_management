const express = require('express');
const asyncHandler = require('../utils/asyncHandler');

function createEmployeeRouter(controller) {
  const router = express.Router();

  router.post('/', asyncHandler((req, res, next) => controller.create(req, res, next)));
  router.get('/', asyncHandler((req, res, next) => controller.findAll(req, res, next)));
  router.get('/:id', asyncHandler((req, res, next) => controller.findById(req, res, next)));
  router.patch('/:id', asyncHandler((req, res, next) => controller.update(req, res, next)));
  router.delete('/:id', asyncHandler((req, res, next) => controller.remove(req, res, next)));

  return router;
}

module.exports = { createEmployeeRouter };
