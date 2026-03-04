import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import LoginPage from './pages/LoginPage';
import Marketplace from './pages/Marketplace';
import './index.css';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return user ? (
    <ProductProvider>
      <CartProvider>
        <Marketplace />
      </CartProvider>
    </ProductProvider>
  ) : <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
