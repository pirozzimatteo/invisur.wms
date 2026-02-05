import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

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
                bgcolor: '#F5F5F7', // Premium Light Grey
                color: '#1D1D1F' // Apple-like Dark Grey
            }}
        >
            <Paper
                elevation={0} // Flat, modern look with border
                sx={{
                    p: 6,
                    width: '100%',
                    maxWidth: 480,
                    borderRadius: 5,
                    textAlign: 'center',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E5E5E5',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                }}
            >
                {/* Logo / Brand Placeholder */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <img src={logo} alt="INVISUR Logo" style={{ height: 300 }} />
                </Box>

                <Typography variant="h4" fontWeight="800" sx={{ mb: 1, letterSpacing: -0.5, color: '#1D1D1F' }}>
                    Welcome Back
                </Typography>


                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                        autoFocus
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                backgroundColor: '#F5F5F7',
                                '& fieldset': { border: 'none' },
                                '&:hover fieldset': { border: '1px solid #E5E5E5' },
                                '&.Mui-focused fieldset': { border: '1px solid #000' }, // Black focus
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        sx={{
                            mb: 4,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                backgroundColor: '#F5F5F7',
                                '& fieldset': { border: 'none' },
                                '&:hover fieldset': { border: '1px solid #E5E5E5' },
                                '&.Mui-focused fieldset': { border: '1px solid #000' },
                            }
                        }}
                    />
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                            py: 2,
                            borderRadius: 3,
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            bgcolor: '#000000',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            '&:hover': {
                                bgcolor: '#333333',
                                boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                            }
                        }}
                    >
                        Sign In
                    </Button>
                </form>

                <Box sx={{ mt: 6 }}>
                    <Typography variant="caption" sx={{ color: '#86868B' }}>
                        &copy; 2026 INVISUR CORP
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
