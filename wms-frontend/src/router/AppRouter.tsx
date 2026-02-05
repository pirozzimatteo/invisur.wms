import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Locations from '../pages/Locations';
import Inbound from '../pages/Inbound';
import Outbound from '../pages/Outbound';
import StockMove from '../pages/StockMove';
import Inventory from '../pages/Inventory';
import Login from '../pages/Login';
import Settings from '../pages/Settings';
import Items from '../pages/Items';

function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: 'locations',
                        element: <Locations />,
                    },
                    {
                        path: 'inbound',
                        element: <Inbound />,
                    },
                    {
                        path: 'outbound',
                        element: <Outbound />,
                    },
                    {
                        path: 'move',
                        element: <StockMove />,
                    },
                    {
                        path: 'inventory',
                        element: <Inventory />,
                    },
                    {
                        path: 'items',
                        element: <Items />,
                    },
                    {
                        path: 'settings',
                        element: <Settings />,
                    },
                ],
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    }
]);

export default function AppRouter() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}
