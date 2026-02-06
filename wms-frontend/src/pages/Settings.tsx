import { Typography, Box, Paper, Avatar, Grid, TextField, Button, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';


export default function Settings() {
    const { user, logout } = useAuth();

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h1" gutterBottom>Impostazioni</Typography>

            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h2" gutterBottom>Profilo</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                    <Avatar
                        sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'secondary.main' }}
                    >
                        {user?.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h3">{user?.username}</Typography>
                        <Typography variant="body1" color="textSecondary">Ruolo: {user?.role}</Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                        <Button variant="outlined" color="error" onClick={logout}>Disconnetti</Button>
                    </Box>
                </Box>
            </Paper>

            <Paper sx={{ p: 4 }}>
                <Typography variant="h2" gutterBottom>Configurazione Magazzino</Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Nome Magazzino" defaultValue="Main Hub - Milan" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Fuso Orario" defaultValue="Europe/Rome" />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 1 }} />
                        {/* Zones section removed - moved to Warehouse Map */}
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
