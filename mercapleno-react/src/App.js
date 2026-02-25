// 🟢 src/App.js (VERSION FINAL Y CORREGIDA con RegistroMovimientos)

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Importación de Contextos y Componentes
import { CartProvider } from './context/CartContext'; 
import { useAuthContext } from './context/AuthContext'; 
import Header from './components/ui/Header'; 
import InventoryPage from './pages/InventoryPage'; 
import CartPage from './pages/CartPage'; 			
import TicketPage from './pages/TicketPage'; 	
import Login from './Login'; 					 
import Registro from './registro'; 			 
import Verificar from './verificar';
import Recuperar from './recuperar';
import AdminDashboard from './pages/AdminDashboard'; 
// 🔑 IMPORTACIONES CLAVE para la nueva funcionalidad
import Estadisticas from './pages/Estadisticas'; 
import UsuarioC from './pages/usuarioC'; 
import ListaProductosAdmin from './pages/Lista_productos'; // CRUD Completo (Admin)
// import ListaProductosEmployee from './pages/Lista_productos_Empleado'; // <-- ELIMINADO/COMENTADO
import RegistroMovimientos from './pages/RegistroMovimientos'; // <-- AÑADIDO (CAMBIO 1)


/**
 * 💡 COMPONENTE AUXILIAR: RoleRoute (Se mantiene sin cambios)
 */
function RoleRoute({ requiredRoles, element }) {
    const { user } = useAuthContext();
    
    // Si no hay usuario o no está autenticado, no podemos determinar el rol
    if (!user) {
        // Asumiendo que el componente padre ya maneja la redirección a /login para rutas protegidas
        return <Navigate to="/login" replace />; 
    }

    // Comprobar si el rol del usuario está en la lista de roles requeridos
    if (requiredRoles.includes(user.id_rol)) {
        return element; // Permitir acceso
    }

    // Redirigir si el rol no tiene permiso
    console.warn(`Acceso denegado. Rol ${user.id_rol} intentó acceder a ruta restringida.`);
    return <Navigate to="/unauthorized" replace />; 
}


function App() {
	const { user, isAuthenticated } = useAuthContext();

	// Determina la ruta de inicio tras el login si no se especifica una
    const getHomeRoute = () => {
        if (!user || !user.id_rol) {
            return "/login"; 
        }
        // Rol 3 (Cliente) va a /catalogo. Roles 1 (Admin) y 2 (Empleado) van a /usuarioC (Dashboard de Operaciones)
        return user.id_rol === 3 ? "/catalogo" : "/usuarioC";
    };


	return (
		<CartProvider>
			{isAuthenticated && user && <Header />}
			<Routes>
				
				{/* 🔒 RUTAS PÚBLICAS */}
				<Route path="/" element={
                    isAuthenticated ? <Navigate to={getHomeRoute()} replace /> : <Navigate to="/login" replace />
                } />
				<Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to={getHomeRoute()} replace /> : <Login />}
                />
				<Route
                    path="/registro"
                    element={isAuthenticated ? <Navigate to={getHomeRoute()} replace /> : <Registro />}
                />
				<Route
                    path="/verificar"
                    element={isAuthenticated ? <Navigate to={getHomeRoute()} replace /> : <Verificar />}
                />
				<Route
                    path="/recuperar"
                    element={isAuthenticated ? <Navigate to={getHomeRoute()} replace /> : <Recuperar />}
                />
				<Route path="/unauthorized" element={<h1 style={{textAlign: 'center', marginTop: '100px'}}>Acceso Denegado (403)</h1>} />

				{/* 🛒 RUTAS DE VENTA (Acceso: Todos los Roles Autenticados - 1, 2, 3) */}
				<Route path="/catalogo" element={
                    <RoleRoute requiredRoles={[1, 2, 3]} element={<InventoryPage />} />
                } />
				<Route path="/cart" element={
                    <RoleRoute requiredRoles={[1, 2, 3]} element={<CartPage />} />
                } />
				<Route path="/ticket" element={
                    <RoleRoute requiredRoles={[1, 2, 3]} element={<TicketPage />} />
                } />
				
				{/* 💻 DASHBOARD Y MÓDULOS OPERACIONALES (Roles 1 y 2) */}
                <Route path="/usuarioC" element={
                    <RoleRoute requiredRoles={[1, 2]} element={<AdminDashboard />} /> 
                } />
				
				{/* 🟢 RUTAS DE PRODUCTOS - DIVIDIDAS POR ROL */}
				
				{/* RUTA: Admin Products (CRUD Completo) */}
				<Route path="/products/admin" element={
					<RoleRoute requiredRoles={[1]} element={<ListaProductosAdmin />} />	
				} />

				{/* 🔑 CAMBIO 2: RUTA: Employee Products (Ahora es Registro de Movimientos) */}
				<Route path="/products/employee" element={
					<RoleRoute requiredRoles={[1, 2]} element={<RegistroMovimientos />} /> // <-- ¡Cambiado!
				} />
				
				{/* 🔑 GESTIÓN DE USUARIOS (Rol 1 - Administrador) */}
				<Route path="/admin/users" element={
                    <RoleRoute requiredRoles={[1]} element={<UsuarioC />} /> 
                } />

				{/* 🔑 MÓDULO DE REPORTES (Roles 1 y 2) */}
				<Route path="/estadisticas" element={
                    <RoleRoute requiredRoles={[1, 2]} element={<Estadisticas />} /> 
                } />

				{/* Ruta comodín (Se mantiene) */}
				<Route path="*" element={
                    isAuthenticated && user ? (
                        <Navigate to={getHomeRoute()} replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                } />

			</Routes>
		</CartProvider>
	);
}

export default App;
