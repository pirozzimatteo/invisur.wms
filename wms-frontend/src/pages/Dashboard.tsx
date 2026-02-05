import { useState, useEffect } from 'react';
import { Typography, Box, Paper, Grid, Card, CardContent, LinearProgress, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../services/api';
import type { Activity, ZoneCapacity } from '../types';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalItems: 0,
        pendingOrders: 0,
        outboundToday: 0,
        lowStockAlerts: 0
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [capacities, setCapacities] = useState<ZoneCapacity[]>([]);

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
            }
        };
        fetchData();
        // Poll every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

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
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h1">Dashboard</Typography>
                <Typography variant="body1" color="textSecondary">Overview of warehouse operations</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">Total Items</Typography>
                                <InventoryIcon color="primary" />
                            </Box>
                            <Typography variant="h3">{stats.totalItems}</Typography>
                            <Typography variant="caption" color="success.main">Live Data</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">Pending Orders</Typography>
                                <AssignmentIcon color="secondary" />
                            </Box>
                            <Typography variant="h3">{stats.pendingOrders}</Typography>
                            <Typography variant="caption" color="textSecondary">Needs attention</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">Pending Tasks</Typography>
                                <LocalShippingIcon color="success" />
                            </Box>
                            <Typography variant="h3">{stats.outboundToday}</Typography>
                            <Typography variant="caption" color="textSecondary">To be picked</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">Low Stock Alerts</Typography>
                                <WarningIcon color="warning" />
                            </Box>
                            <Typography variant="h3">{stats.lowStockAlerts}</Typography>
                            <Typography variant="caption" color="error.main">High Priority</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 0, overflow: 'hidden', height: '100%' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                            <Typography variant="h2">Recent Activity</Typography>
                        </Box>
                        <List>
                            {activities.length === 0 ? (
                                <ListItem><ListItemText primary="No recent activity found." /></ListItem>
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
                                                            {activity.type === 'MOVE' && `Moved from ${activity.sourceLocation || '?'} to ${activity.targetLocation || '?'}`}
                                                            {activity.type === 'INBOUND' && `Received at ${activity.targetLocation || '?'}`}
                                                            {activity.type === 'OUTBOUND' && `Shipped from ${activity.sourceLocation || '?'}`}
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
                        <Typography variant="h2" gutterBottom>Warehouse Capacity</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ mb: 4, display: 'block' }}>
                            Occupancy per Zone (Calculated based on Volume)
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {capacities.length === 0 ? (
                                <Typography>No zones defined.</Typography>
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
                            <Typography variant="subtitle2" gutterBottom>System Status</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                <Typography variant="caption">Database: Connected</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                <Typography variant="caption">Services: Operational</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
