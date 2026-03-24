import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import TenantList from './pages/tenants/TenantList';
import TenantForm from './pages/tenants/TenantForm';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import ProductForm from './pages/products/ProductForm';
import InventoryList from './pages/inventory/InventoryList';
import InventoryDetail from './pages/inventory/InventoryDetail';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import OrderForm from './pages/orders/OrderForm';
import OrderEdit from './pages/orders/OrderEdit';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/tenants" replace />} />
        
        {/* Tenants */}
        <Route path="tenants" element={<TenantList />} />
        <Route path="tenants/new" element={<TenantForm />} />
        <Route path="tenants/:id" element={<TenantForm />} />
        <Route path="tenants/:id/edit" element={<TenantForm />} />

        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="products/:id/edit" element={<ProductForm />} />

        {/* Inventory */}
        <Route path="inventory" element={<InventoryList />} />
        <Route path="inventory/:id" element={<InventoryDetail />} />

        {/* Orders */}
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/new" element={<OrderForm />} />
        <Route path="orders/:id/edit" element={<OrderEdit />} />
        <Route path="orders/:id" element={<OrderDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
