import { useState, useEffect } from 'react';
import { Typography, Box, Paper, Grid, Card, CardContent, LinearProgress, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import api, { itemService } from '../services/api';
import type { Activity, ZoneCapacity, Item } from '../types';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalItems: 0,
        pendingOrders: 0,
        outboundToday: 0,
        lowStockAlerts: 0
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [capacities, setCapacities] = useState<ZoneCapacity[]>([]);
    const [lowStockOpen, setLowStockOpen] = useState(false);
    const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const navigate = useNavigate();

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activityRes, capacityRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/recent-activity'),
                    api.get('/dashboard/capacity')
                ]);
                setStats(statsRes.data);
                setActivities(activityRes.data);
                setCapacities(capacityRes.data);
            } catch (err) {
                console.error(err);
                // Optionally show error for background polling? Better not spam.
            }
        };
        fetchData();
        // Poll every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchLowStock = async () => {
        try {
            const res = await itemService.getLowStock();
            setLowStockItems(res.data);
            setLowStockOpen(true);
        } catch (err: any) {
            console.error("Failed to fetch low stock items", err);
            showMessage(
                err.response?.data?.message || 'Impossibile recuperare gli articoli in esaurimento',
                'error'
            );
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'INBOUND': return <AssignmentIcon />;
            case 'OUTBOUND': return <LocalShippingIcon />;
            case 'MOVE': return <InventoryIcon />;
            default: return <InventoryIcon />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'INBOUND': return 'primary.light';
            case 'OUTBOUND': return 'success.light';
            case 'MOVE': return 'secondary.light';
            default: return 'grey.300';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h1">Dashboard</Typography>
                <Typography variant="body1" color="textSecondary">Panoramica delle operazioni di magazzino</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">Totale Articoli</Typography>
                                <InventoryIcon color="primary" />
                            </Box>
                            <Typography variant="h3">{stats.totalItems}</Typography>
                            <Typography variant="caption" color="success.main">Dati in Tempo Reale</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }} onClick={() => navigate('/outbound')} sx={{ cursor: 'pointer' }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">Ordini in Sospeso</Typography>
                                <AssignmentIcon color="secondary" />
                            </Box>
                            <Typography variant="h3">{stats.pendingOrders}</Typography>
                            <Typography variant="caption" color="textSecondary">Richiede attenzione</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }} onClick={() => navigate('/outbound')} sx={{ cursor: 'pointer' }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">Attività in Sospeso</Typography>
                                <LocalShippingIcon color="success" />
                            </Box>
                            <Typography variant="h3">{stats.outboundToday}</Typography>
                            <Typography variant="caption" color="textSecondary">Da prelevare</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }} onClick={fetchLowStock} sx={{ cursor: 'pointer' }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">Allarmi Scorte Basse</Typography>
                                <WarningIcon color="warning" />
                            </Box>
                            <Typography variant="h3">{stats.lowStockAlerts}</Typography>
                            <Typography variant="caption" color="error.main">Alta Priorità (Clicca per dettagli)</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 0, overflow: 'hidden', height: '100%' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                            <Typography variant="h2">Attività Recenti</Typography>
                        </Box>
                        <List>
                            {activities.length === 0 ? (
                                <ListItem><ListItemText primary="Nessuna attività recente trovata." /></ListItem>
                            ) : (
                                activities.map((activity) => (
                                    <div key={activity.id}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                                                    {getActivityIcon(activity.type)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={`[${activity.itemCode}] ${activity.description}`}
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2" color="textPrimary">
                                                            {activity.type === 'MOVE' && `Spostato da ${activity.sourceLocation || '?'} a ${activity.targetLocation || '?'}`}
                                                            {activity.type === 'INBOUND' && `Ricevuto in ${activity.targetLocation || '?'}`}
                                                            {activity.type === 'OUTBOUND' && `Spedito da ${activity.sourceLocation || '?'}`}
                                                        </Typography>
                                                        <br />
                                                        {new Date(activity.timestamp).toLocaleString()}
                                                    </>
                                                }
                                            />
                                            {/* <Chip label={activity.quantity} size="small" variant="outlined" /> */}
                                        </ListItem>
                                        <Divider variant="inset" component="li" />
                                    </div>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h2" gutterBottom>Capacità Magazzino</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ mb: 4, display: 'block' }}>
                            Occupazione per Zona (Calcolata in base al Volume)
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {capacities.length === 0 ? (
                                <Typography>Nessuna zona definita.</Typography>
                            ) : (
                                capacities.map((cap) => (
                                    <Box key={cap.zoneName} sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">{cap.zoneName}</Typography>
                                            <Typography variant="body2" fontWeight="bold">{cap.percentage}%</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={cap.percentage}
                                            color={cap.percentage > 90 ? 'error' : cap.percentage > 70 ? 'warning' : 'primary'}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                ))
                            )}
                        </Box>

                        <Box sx={{ mt: 6, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Stato del Sistema</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                <Typography variant="caption">Database: Connesso</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                <Typography variant="caption">Servizi: Operativi</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Low Stock Dialog */}
            <Dialog open={lowStockOpen} onClose={() => setLowStockOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Articoli in Esaurimento (Sotto Soglia)</DialogTitle>
                <DialogContent>
                    <List>
                        {lowStockItems.length === 0 ? (
                            <ListItem><ListItemText primary="Nessun articolo sotto soglia." /></ListItem>
                        ) : (
                            lowStockItems.map((item) => (
                                <ListItem key={item.id}>
                                    <ListItemText
                                        primary={`[${item.internalCode}] ${item.description}`}
                                        secondary={`Punto di Riordino: ${item.reorderPoint}`}
                                    />
                                    <Button variant="outlined" size="small" component={Link} to={`/inventory?search=${item.internalCode}`}>
                                        Vedi Stock
                                    </Button>
                                </ListItem>
                            ))
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLowStockOpen(false)}>Chiudi</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

