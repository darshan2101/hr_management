class EmployeeController {
  constructor(employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  async create(req, res, next) {
    try {
      const created = this.employeeRepository.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const result = this.employeeRepository.findAll({
        page: Number.isNaN(page) ? undefined : page,
        limit: Number.isNaN(limit) ? undefined : limit,
        search: req.query.search,
        country: req.query.country,
        jobTitle: req.query.jobTitle,
        department: req.query.department,
        salaryMin: req.query.salary_min ? Number(req.query.salary_min) : undefined,
        salaryMax: req.query.salary_max ? Number(req.query.salary_max) : undefined,
        hireDateFrom: req.query.hire_date_from,
        hireDateTo: req.query.hire_date_to,
        sortBy: req.query.sort_by,
        sortOrder: req.query.sort_order
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCountries(req, res, next) {
    try {
      const countries = this.employeeRepository.getDistinctCountries();
      res.json({ countries });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const employee = this.employeeRepository.findById(Number(req.params.id));
      if (!employee) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.json(employee);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = this.employeeRepository.update(Number(req.params.id), req.body);
      if (!updated) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const removed = this.employeeRepository.delete(Number(req.params.id));
      if (!removed) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EmployeeController;
