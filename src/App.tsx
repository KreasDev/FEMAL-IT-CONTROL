import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Accesos from './pages/Accesos';
import Respaldos from './pages/Respaldos';
import Proveedores from './pages/Proveedores';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accesos" element={<Accesos />} />
          <Route path="/respaldos" element={<Respaldos />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
