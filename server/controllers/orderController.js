const service = require('../services/orderService');
const { ok } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { tenantId, tenant_id, search = '', page = 1, limit = 10 } = req.query;
    const tid = tenantId || tenant_id;
    const result = await service.listOrders({ tenantId: tid, search, page: +page, limit: +limit });
    const stats = tid ? await service.getOrderStats(tid) : null;
    ok(res, { rows: result.rows, stats }, { total: result.total, page: +page, limit: +limit });
  } catch (e) { next(e); }
};

const get = async (req, res, next) => {
  try {
    const tid = req.query.tenantId || req.query.tenant_id;
    ok(res, await service.getOrder(req.params.id, tid));
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { tenantId, tenant_id, productId, product_id, quantity } = req.body;
    const tid = tenantId || tenant_id;
    const pid = productId || product_id;
    ok(res, await service.createOrder({ tenantId: tid, productId: pid, quantity: +quantity }), null, 201);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const { tenantId, tenant_id, status, productId, product_id, quantity } = req.body;
    const tid = tenantId || tenant_id;
    if (!tid) throw Object.assign(new Error('tenantId is required'), { status: 400 });

    const hasStatus = status !== undefined && status !== null && String(status).length > 0;
    const pid = productId || product_id;

    if (hasStatus) {
      ok(res, await service.updateOrder(req.params.id, tid, { status }));
    } else if (pid) {
      ok(res, await service.reviseOrder(req.params.id, tid, { productId: pid, quantity: +quantity }));
    } else {
      throw Object.assign(new Error('Provide status or productId and quantity'), { status: 400 });
    }
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const tid = req.query.tenantId || req.query.tenant_id;
    if (!tid) throw Object.assign(new Error('tenantId is required'), { status: 400 });
    await service.deleteOrder(req.params.id, tid);
    ok(res, { message: 'Order deleted' });
  } catch (e) { next(e); }
};

module.exports = { list, get, create, update, remove };
