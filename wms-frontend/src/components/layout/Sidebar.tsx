import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Typography, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Warehouse Map', icon: <WarehouseIcon />, path: '/locations' },
    { text: 'Items', icon: <InventoryIcon />, path: '/items' },
    { text: 'Inbound', icon: <InputIcon />, path: '/inbound' },
    { text: 'Outbound', icon: <OutputIcon />, path: '/outbound' },
    { text: 'Internal Move', icon: <InventoryIcon />, path: '/move' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
        >
            <Toolbar sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center', // Center content
                flexDirection: 'column', // Stack if needed, or row
                py: 2, // Padding vertical
                bgcolor: 'black', // Brand color
                color: 'white'
            }}>
            </Toolbar>
            <Divider sx={{ borderColor: '#333' }} />
            <List sx={{ bgcolor: '#f5f5f5', height: '100%' }}>
                {menuItems.map((item) => (
                    <ListItemButton
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        selected={location.pathname === item.path}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItemButton>
                ))}
            </List>
        </Drawer>
    );
}
