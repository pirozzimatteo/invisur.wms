import { useState, useEffect } from 'react';
import {
    Typography, Box, TextField, Button, Paper, Grid,
    Alert, CircularProgress, Stepper, Step, StepLabel, Card, CardContent
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemService, locationService, inboundService } from '../services/api';
import type { Item, Location } from '../types';
import ItemAutocomplete from '../components/common/ItemAutocomplete';
import LocationAutocomplete from '../components/common/LocationAutocomplete';

export default function Inbound() {
    const queryClient = useQueryClient();
    const [activeStep, setActiveStep] = useState(0);
    const [scanCode, setScanCode] = useState<string | null>(null);
    const [itemData, setItemData] = useState<Item | null>(null);
    const [locationCode, setLocationCode] = useState('');
    const [quantity, setQuantity] = useState('');
    const [batch, setBatch] = useState('');
    const [error, setError] = useState('');

    // Clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleInputChange = (setter: (val: string) => void, val: string) => {
        setError('');
        setter(val);
    };

    const resolveItem = async () => {
        if (!scanCode) return;
        try {
            setError('');
            const response = await itemService.resolveByCode(scanCode);
            setItemData(response.data);
            setActiveStep(1);
        } catch (err) {
            setError('Item not found');
        }
    };

    const confirmPutaway = useMutation({
        mutationFn: inboundService.confirmPutaway,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setActiveStep(2);
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || err.message || 'Failed to confirm putaway.';
            // Clean up java exception prefix if present
            const cleanMsg = msg.includes('IllegalArgumentException:') ? msg.split('IllegalArgumentException:')[1].trim() : msg;
            setError(cleanMsg);
        }
    });

    const handleSubmit = async () => {
        try {
            // fetching all locations to find id - optimization: specific endpoint lookup would be better
            const response = await locationService.getAll();
            const locations = response.data;
            const loc = locations.find((l: Location) => l.code === locationCode);

            if (!loc) {
                setError('Location Code not found');
                return;
            }

            if (!itemData) return;

            await confirmPutaway.mutateAsync({
                itemId: itemData.id,
                locationId: loc.id,
                quantity: Number(quantity),
                batchNumber: batch
            });

        } catch (e) {
            // handled by mutation onError
        }
    };

    const reset = () => {
        setActiveStep(0);
        setScanCode(null);
        setItemData(null);
        setLocationCode('');
        setQuantity('');
        setBatch('');
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h1" gutterBottom>Inbound Putaway</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                <Step><StepLabel>Scan Item</StepLabel></Step>
                <Step><StepLabel>Details & Location</StepLabel></Step>
                <Step><StepLabel>Done</StepLabel></Step>
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {activeStep === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>Scan or Select Item</Typography>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid size={8}>
                            <ItemAutocomplete
                                value={scanCode}
                                onChange={(newCode) => handleInputChange(setScanCode, newCode || '')}
                                label="Item Code / SKU"
                            />
                        </Grid>
                        <Grid size={4}>
                            <Button variant="contained" size="large" onClick={resolveItem} sx={{ mt: 1, height: '56px' }} disabled={!scanCode}>
                                Find
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {activeStep === 1 && itemData && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary">Item Details</Typography>
                                <Typography variant="h4">{itemData.internalCode}</Typography>
                                <Typography variant="body1">{itemData.description}</Typography>
                                <Typography variant="caption">{itemData.category} - {itemData.unitOfMeasure}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3 }}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => handleInputChange(setQuantity, e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <LocationAutocomplete
                                value={locationCode}
                                onChange={(newCode) => handleInputChange(setLocationCode, newCode || '')}
                                label="Target Location Code"
                                helperText="Select from list"
                            />
                            <TextField
                                fullWidth
                                label="Batch (Optional)"
                                value={batch}
                                onChange={(e) => handleInputChange(setBatch, e.target.value)}
                                sx={{ mb: 2, mt: 2 }}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={handleSubmit}
                                disabled={confirmPutaway.isPending}
                            >
                                {confirmPutaway.isPending ? <CircularProgress size={24} /> : 'Confirm Putaway'}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {activeStep === 2 && (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" gutterBottom>Success!</Typography>
                    <Typography paragraph>Stock has been created successfully.</Typography>
                    <Button variant="outlined" onClick={reset}>Scan Next Item</Button>
                </Paper>
            )}
        </Box>
    );
}
