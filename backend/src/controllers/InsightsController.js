class InsightsController {
  constructor(insightsRepository) {
    this.insightsRepository = insightsRepository;
  }

  async getByCountry(req, res, next) {
    try {
      const result = this.insightsRepository.getByCountry(req.params.country);
      if (!result) {
        res.status(404).json({ error: 'No employees found for country' });
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getByJobTitle(req, res, next) {
    try {
      const { jobTitle, country } = req.query;
      if (!jobTitle || !country) {
        res.status(400).json({ error: 'jobTitle and country are required' });
        return;
      }
      const result = this.insightsRepository.getByJobTitle(jobTitle, country);
      if (!result) {
        res.status(404).json({ error: 'No employees found for job title and country' });
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const result = this.insightsRepository.getSummary();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InsightsController;
