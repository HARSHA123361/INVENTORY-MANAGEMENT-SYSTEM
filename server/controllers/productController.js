const service = require('../services/productService');
const { ok } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { tenantId, tenant_id, search, sort, order, page = 1, limit = 10 } = req.query;
    const tid = tenantId || tenant_id;
    const result = await service.listProducts({ tenantId: tid, search, sort, order, page: +page, limit: +limit });
    const stats = tid ? await service.getProductStats(tid) : null;
    ok(res, { rows: result.rows, stats }, { total: result.total, page: +page, limit: +limit });
  } catch (e) { next(e); }
};

const getActive = async (req, res, next) => {
  try {
    const tid = req.query.tenantId || req.query.tenant_id;
    ok(res, await service.getActiveProducts(tid));
  } catch (e) { next(e); }
};

const get = async (req, res, next) => {
  try {
    const tid = req.query.tenantId || req.query.tenant_id;
    ok(res, await service.getProduct(req.params.id, tid));
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { 
      tenantId, tenant_id, 
      name, sku, category, status, 
      reorderThreshold, reorder_threshold, 
      costPerUnit, cost_per_unit 
    } = req.body;
    const tid = tenantId || tenant_id;
    const rt = reorderThreshold !== undefined ? reorderThreshold : reorder_threshold;
    const cpu = costPerUnit !== undefined ? costPerUnit : cost_per_unit;
    ok(res, await service.createProduct({ 
      tenantId: tid, 
      name, sku, category, status, 
      reorderThreshold: rt, 
      costPerUnit: cpu 
    }), null, 201);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const tid = req.query.tenantId || req.query.tenant_id;
    const { 
      name, sku, category, status,
      reorderThreshold, reorder_threshold,
      costPerUnit, cost_per_unit
    } = req.body;
    const rt = reorderThreshold !== undefined ? reorderThreshold : reorder_threshold;
    const cpu = costPerUnit !== undefined ? costPerUnit : cost_per_unit;
    ok(res, await service.updateProduct(req.params.id, tid, { name, sku, category, status, reorderThreshold: rt, costPerUnit: cpu }));
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const tid = req.query.tenantId || req.query.tenant_id;
    await service.deleteProduct(req.params.id, tid);
    ok(res, { message: 'Product deleted' });
  } catch (e) { next(e); }
};

module.exports = { list, getActive, get, create, update, remove };
