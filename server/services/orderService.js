const orderRepo = require('../repositories/orderRepository');
const productRepo = require('../repositories/productRepository');
const inventoryRepo = require('../repositories/inventoryRepository');

const listOrders = async (query) => {
  if (!query.tenantId) throw Object.assign(new Error('tenantId is required'), { status: 400 });
  return orderRepo.findAll(query);
};

const getOrder = async (id, tenantId) => {
  if (!tenantId) throw Object.assign(new Error('tenantId is required'), { status: 400 });
  const order = await orderRepo.findById(id, tenantId);
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  return order;
};

/**
 * Core business rule:
 *   1. Product must be Active (cannot order Inactive products).
 *   2. If inventory >= requested_quantity  → status = 'Created'
 *      If inventory <  requested_quantity  → status = 'Pending'
 */
const createOrder = async ({ tenantId, productId, quantity }) => {
  const product = await productRepo.findById(productId, tenantId);
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  if (product.status !== 'Active')
    throw Object.assign(new Error('Cannot create an order for an Inactive product'), { status: 400 });

  const inventory = await inventoryRepo.findByProductId(productId);
  const availableQty = inventory ? inventory.quantity : 0;
  const status = availableQty >= quantity ? 'Created' : 'Pending';

  return orderRepo.create({ tenantId, productId, quantity, status });
};

/**
 * Confirm or Cancel an existing order.
 * Only allowed transitions: Created/Pending → Confirmed, Created/Pending → Cancelled
 */
const updateOrder = async (id, tenantId, { status }) => {
  const ALLOWED = ['Confirmed', 'Cancelled'];
  if (!ALLOWED.includes(status))
    throw Object.assign(new Error(`Status must be one of: ${ALLOWED.join(', ')}`), { status: 400 });

  const existing = await orderRepo.findById(id, tenantId);
  if (!existing) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (['Confirmed', 'Cancelled'].includes(existing.status))
    throw Object.assign(new Error(`Cannot change status of a ${existing.status} order`), { status: 409 });

  if (status === 'Confirmed') {
    const inv = await inventoryRepo.findByProductId(existing.product_id);
    const available = inv ? inv.quantity : 0;
    if (!inv) throw Object.assign(new Error('No inventory record for this product'), { status: 400 });
    if (available < existing.quantity) {
      throw Object.assign(
        new Error('Insufficient inventory to confirm this order. Restock or reduce quantity.'),
        { status: 400 }
      );
    }
    await inventoryRepo.update(inv.id, available - existing.quantity);
  }

  return orderRepo.update(id, { status });
};

/** Revise product/qty while order is Created or Pending (re-evaluates Created vs Pending). */
const reviseOrder = async (id, tenantId, { productId, quantity }) => {
  if (!quantity || quantity < 1)
    throw Object.assign(new Error('quantity must be a positive number'), { status: 400 });

  const existing = await orderRepo.findById(id, tenantId);
  if (!existing) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (['Confirmed', 'Cancelled'].includes(existing.status))
    throw Object.assign(new Error(`Cannot edit a ${existing.status} order`), { status: 409 });

  const product = await productRepo.findById(productId, tenantId);
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  if (product.status !== 'Active')
    throw Object.assign(new Error('Cannot use an Inactive product on an order'), { status: 400 });

  const inventory = await inventoryRepo.findByProductId(productId);
  const availableQty = inventory ? inventory.quantity : 0;
  const nextStatus = availableQty >= quantity ? 'Created' : 'Pending';

  return orderRepo.updateLine(id, { productId, quantity, status: nextStatus });
};

const deleteOrder = async (id, tenantId) => {
  const deleted = await orderRepo.remove(id, tenantId);
  if (!deleted) throw Object.assign(new Error('Order not found'), { status: 404 });
};

const getOrderStats = (tenantId) => orderRepo.statsForTenant(tenantId);

module.exports = {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  reviseOrder,
  deleteOrder,
  getOrderStats,
};
