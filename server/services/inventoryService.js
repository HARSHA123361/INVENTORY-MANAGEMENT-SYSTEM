const repo = require('../repositories/inventoryRepository');

const listInventory = async (query) => {
  if (!query.tenantId) throw Object.assign(new Error('tenantId is required'), { status: 400 });
  return repo.findAll(query);
};

const getInventory = async (id, tenantId) => {
  if (!tenantId) throw Object.assign(new Error('tenantId is required'), { status: 400 });
  const inv = await repo.findById(id, tenantId);
  if (!inv) throw Object.assign(new Error('Inventory record not found'), { status: 404 });
  return inv;
};

const updateInventory = async (id, tenantId, quantity) => {
  if (quantity < 0) throw Object.assign(new Error('Quantity cannot be negative'), { status: 400 });
  await getInventory(id, tenantId);
  const updated = await repo.update(id, quantity);
  if (!updated) throw Object.assign(new Error('Inventory record not found'), { status: 404 });
  return updated;
};

const deleteInventory = async (id, tenantId) => {
  await getInventory(id, tenantId);
  const deleted = await repo.remove(id);
  if (!deleted) throw Object.assign(new Error('Inventory record not found'), { status: 404 });
};

const getInventoryStats = (tenantId) => repo.statsForTenant(tenantId);

module.exports = { listInventory, getInventory, updateInventory, deleteInventory, getInventoryStats };
