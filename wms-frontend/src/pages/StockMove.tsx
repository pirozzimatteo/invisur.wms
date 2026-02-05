import { useState } from 'react';
import { Typography, Box, Paper, Grid, TextField, Button, Alert, CircularProgress } from '@mui/material';
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

    const moveMutation = useMutation({
        mutationFn: StockService.moveStock,
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            // Clear fields (keep source/target for rapid moves? maybe clear item)
            setItemCode('');
            setQty('');
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
            <Typography variant="h1" gutterBottom>Internal Stock Move</Typography>

            {success && <Alert severity="success" sx={{ mb: 2 }}>Move Confirmed!</Alert>}

            <Paper sx={{ p: 4 }}>
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <LocationAutocomplete
                            label="Source Location"
                            value={sourceLoc}
                            onChange={(code) => setSourceLoc(code || '')}
                        />
                    </Grid>
                    <Grid size={12}>
                        <ItemAutocomplete
                            label="Item Code"
                            value={itemCode}
                            onChange={(code) => setItemCode(code || '')}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            fullWidth label="Quantity" type="number"
                            value={qty} onChange={(e) => setQty(e.target.value)}
                        />
                    </Grid>
                    <Grid size={12}>
                        <LocationAutocomplete
                            label="Target Location"
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
                            {moveMutation.isPending ? <CircularProgress size={24} /> : 'Confirm Move'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
