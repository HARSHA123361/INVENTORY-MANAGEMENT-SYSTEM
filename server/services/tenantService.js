const repo = require('../repositories/tenantRepository');

const listTenants = async (query) => {
  return repo.findAll(query);
};

const getTenant = async (id) => {
  const tenant = await repo.findById(id);
  if (!tenant) throw Object.assign(new Error('Tenant not found'), { status: 404 });
  return tenant;
};

const createTenant = async ({ name, status }) => {
  const existing = await repo.findByName(name);
  if (existing) throw Object.assign(new Error('A tenant with this name already exists'), { status: 409 });
  return repo.create({ name, status });
};

const updateTenant = async (id, body) => {
  // Check name uniqueness if name is being changed
  if (body.name) {
    const existing = await repo.findByName(body.name);
    if (existing && existing.id !== id) throw Object.assign(new Error('Tenant name already in use'), { status: 409 });
  }
  const updated = await repo.update(id, body);
  if (!updated) throw Object.assign(new Error('Tenant not found'), { status: 404 });
  return updated;
};

const deleteTenant = async (id) => {
  const deleted = await repo.remove(id);
  if (!deleted) throw Object.assign(new Error('Tenant not found'), { status: 404 });
};

const getTenantStats = () => repo.stats();

module.exports = { listTenants, getTenant, createTenant, updateTenant, deleteTenant, getTenantStats };
