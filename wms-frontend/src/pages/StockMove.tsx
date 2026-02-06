import { useState } from 'react';
import { Typography, Box, Paper, Grid, TextField, Button, Alert, CircularProgress, Snackbar } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StockService } from '../services/StockService';
import type { StockMoveRequest } from '../services/StockService';
import ItemAutocomplete from '../components/common/ItemAutocomplete';
import LocationAutocomplete from '../components/common/LocationAutocomplete';

export default function StockMove() {
    const queryClient = useQueryClient();
    const [itemCode, setItemCode] = useState('');
    const [sourceLoc, setSourceLoc] = useState('');
    const [targetLoc, setTargetLoc] = useState('');
    const [qty, setQty] = useState('');
    const [success, setSuccess] = useState(false);

    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const moveMutation = useMutation({
        mutationFn: StockService.moveStock,
        onSuccess: () => {
            setSuccess(true);
            showMessage('Spostamento completato con successo', 'success');
            setTimeout(() => setSuccess(false), 3000);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setItemCode('');
            setQty('');
        },
        onError: (error: any) => {
            showMessage(error.response?.data?.message || 'Errore durante lo spostamento', 'error');
        }
    });

    const handleMove = () => {
        const req: StockMoveRequest = {
            itemCode,
            sourceLocationCode: sourceLoc,
            targetLocationCode: targetLoc,
            quantity: Number(qty)
        };
        moveMutation.mutate(req);
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h1" gutterBottom>Movimento Interno Merce</Typography>

            {success && <Alert severity="success" sx={{ mb: 2 }}>Spostamento Confermato!</Alert>}

            <Paper sx={{ p: 4 }}>
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <LocationAutocomplete
                            label="Posizione Origine"
                            value={sourceLoc}
                            onChange={(code) => setSourceLoc(code || '')}
                        />
                    </Grid>
                    <Grid size={12}>
                        <ItemAutocomplete
                            label="Codice Articolo"
                            value={itemCode}
                            onChange={(code) => setItemCode(code || '')}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            fullWidth label="Quantità" type="number"
                            value={qty} onChange={(e) => setQty(e.target.value)}
                        />
                    </Grid>
                    <Grid size={12}>
                        <LocationAutocomplete
                            label="Posizione Destinazione"
                            value={targetLoc}
                            onChange={(code) => setTargetLoc(code || '')}
                        />
                    </Grid>
                    <Grid size={12}>
                        <Button
                            fullWidth variant="contained" size="large"
                            onClick={handleMove}
                            disabled={moveMutation.isPending}
                        >
                            {moveMutation.isPending ? <CircularProgress size={24} /> : 'Conferma Spostamento'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

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
