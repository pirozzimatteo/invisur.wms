import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    // const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const from = (location.state as any)?.from?.pathname || '/';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Mock Credentials Check
        if (username === 'admin' && password === 'admin') {
            login(username);
            navigate(from, { replace: true });
        } else {
            setError('Invalid credentials (try admin/admin)');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default'
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 5,
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 3,
                    textAlign: 'center'
                }}
            >
                <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                    WMS Login
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                    Enter your credentials to access the warehouse.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                        autoFocus
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        sx={{ mb: 3 }}
                    />
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                            py: 1.5,
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                    >
                        Sign In
                    </Button>
                </form>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="caption" color="textSecondary">
                        Mock Mode: Use <b>admin / admin</b>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
