const repo = require('../repositories/productRepository');
const tenantRepo = require('../repositories/tenantRepository');

const listProducts = async (query) => {
  if (!query.tenantId) throw Object.assign(new Error('tenantId is required'), { status: 400 });
  return repo.findAll(query);
};

const getProduct = async (id, tenantId) => {
  if (!tenantId) throw Object.assign(new Error('tenantId is required'), { status: 400 });
  const product = await repo.findById(id, tenantId);
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  return product;
};

const getActiveProducts = async (tenantId) => {
  if (!tenantId) throw Object.assign(new Error('tenantId is required'), { status: 400 });
  return repo.findActiveByTenant(tenantId);
};

const createProduct = async (body) => {
  const { tenantId, sku } = body;
  const tenant = await tenantRepo.findById(tenantId);
  if (!tenant) throw Object.assign(new Error('Tenant not found'), { status: 404 });
  return repo.create(body);
};

const updateProduct = async (id, tenantId, body) => {
  await getProduct(id, tenantId);
  return repo.update(id, body);
};

const deleteProduct = async (id, tenantId) => {
  await getProduct(id, tenantId);
  try {
    const deleted = await repo.remove(id);
    if (!deleted) throw Object.assign(new Error('Product not found'), { status: 404 });
  } catch (e) {
    if (e.message && e.message.includes('FOREIGN KEY')) {
      throw Object.assign(
        new Error('Cannot delete this product — it has existing orders. Delete or cancel the orders first.'),
        { status: 409 }
      );
    }
    throw e;
  }
};

const getProductStats = (tenantId) => repo.stats(tenantId);

module.exports = { listProducts, getProduct, getActiveProducts, createProduct, updateProduct, deleteProduct, getProductStats };
