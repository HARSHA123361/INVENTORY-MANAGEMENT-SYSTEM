const service = require('../services/inventoryService');
const { ok } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { tenantId, tenant_id, search = '', page = 1, limit = 10 } = req.query;
    const tid = tenantId || tenant_id;
    const result = await service.listInventory({ tenantId: tid, search, page: +page, limit: +limit });
    const stats = tid ? await service.getInventoryStats(tid) : null;
    ok(res, { rows: result.rows, stats }, { total: result.total, page: +page, limit: +limit });
  } catch (e) { next(e); }
};

const get = async (req, res, next) => {
  try {
    const tid = req.query.tenantId || req.query.tenant_id;
    ok(res, await service.getInventory(req.params.id, tid));
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const tid = req.query.tenantId || req.query.tenant_id;
    const { quantity } = req.body;
    ok(res, await service.updateInventory(req.params.id, tid, +quantity));
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const tid = req.query.tenantId || req.query.tenant_id;
    await service.deleteInventory(req.params.id, tid);
    ok(res, { message: 'Inventory record deleted' });
  } catch (e) { next(e); }
};

module.exports = { list, get, update, remove };
