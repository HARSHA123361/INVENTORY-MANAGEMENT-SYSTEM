const service = require('../services/tenantService');
const { ok, fail } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { search, sort, order, page = 1, limit = 10 } = req.query;
    const result = await service.listTenants({ search, sort, order, page: +page, limit: +limit });
    const stats = await service.getTenantStats();
    ok(res, { rows: result.rows, stats }, { total: result.total, page: +page, limit: +limit });
  } catch (e) { next(e); }
};

const get = async (req, res, next) => {
  try {
    ok(res, await service.getTenant(req.params.id));
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const tenant = await service.createTenant(req.body);
    ok(res, tenant, null, 201);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    ok(res, await service.updateTenant(req.params.id, req.body));
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await service.deleteTenant(req.params.id);
    ok(res, { message: 'Tenant deleted' });
  } catch (e) { next(e); }
};

module.exports = { list, get, create, update, remove };
