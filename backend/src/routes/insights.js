const express = require('express');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function createInsightsRouter(controller) {
  const router = express.Router();

  router.get('/country/:country', asyncHandler((req, res, next) =>
    controller.getByCountry(req, res, next)
  ));
  router.get('/jobtitle', asyncHandler((req, res, next) =>
    controller.getByJobTitle(req, res, next)
  ));
  router.get('/summary', asyncHandler((req, res, next) =>
    controller.getSummary(req, res, next)
  ));

  return router;
}

module.exports = { createInsightsRouter };
