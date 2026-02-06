import { useState } from 'react';
import {
    Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Alert, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OutboundService } from '../services/OutboundService';
import { StockService } from '../services/StockService';
import ItemAutocomplete from '../components/common/ItemAutocomplete';

export default function Outbound() {
    const queryClient = useQueryClient();
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [newOrderCustomer, setNewOrderCustomer] = useState('');
    const [newOrderItems, setNewOrderItems] = useState<{ itemCode: string, quantity: number, sourceLocationCode?: string }[]>([]);

    // Form state for adding one line
    const [tempItemCode, setTempItemCode] = useState<string | null>(null);
    const [tempQty, setTempQty] = useState('');
    const [tempSourceLocation, setTempSourceLocation] = useState(''); // New state


    const [createError, setCreateError] = useState<string | null>(null);

    const { data: orders } = useQuery({
        queryKey: ['outbound-orders'],
        queryFn: OutboundService.getAllOrders
    });

    const { data: tasks } = useQuery({
        queryKey: ['picking-tasks'],
        queryFn: OutboundService.getPendingTasks,
        refetchInterval: 5000 // Poll for updates
    });

    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const confirmTaskMutation = useMutation({
        mutationFn: OutboundService.confirmTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['picking-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['outbound-orders'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            showMessage('Prelievo confermato', 'success');
        },
        onError: (error: any) => {
            showMessage(error.response?.data?.message || 'Errore nella conferma del prelievo', 'error');
        }
    });

    const createOrderMutation = useMutation({
        mutationFn: OutboundService.createOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['outbound-orders'] });
            queryClient.invalidateQueries({ queryKey: ['picking-tasks'] });
            setOpenCreateDialog(false);
            setNewOrderCustomer('');
            setNewOrderItems([]);
            setCreateError(null);
            showMessage('Ordine creato con successo', 'success');
        },
        onError: (error: any) => {
            setCreateError(error.response?.data?.message || 'Impossibile creare l\'ordine');
        }
    });

    const shipOrderMutation = useMutation({
        mutationFn: OutboundService.shipOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['outbound-orders'] });
            showMessage('Ordine spedito', 'success');
        },
        onError: (error: any) => {
            showMessage(error.response?.data?.message || 'Errore nella spedizione dell\'ordine', 'error');
        }
    });

    const handleConfirm = (taskId: string) => {
        confirmTaskMutation.mutate(taskId);
    };

    const handleShip = (orderId: string) => {
        shipOrderMutation.mutate(orderId);
    };

    const handleAddItem = () => {
        if (!tempItemCode || !tempQty) return;
        setNewOrderItems([...newOrderItems, { itemCode: tempItemCode, quantity: Number(tempQty), sourceLocationCode: tempSourceLocation }]);
        setTempItemCode(null);
        setTempQty('');
        setTempSourceLocation('');
    };

    const handleRemoveItem = (index: number) => {
        const updated = [...newOrderItems];
        updated.splice(index, 1);
        setNewOrderItems(updated);
    };

    const handleSubmitOrder = () => {
        setCreateError(null);
        createOrderMutation.mutate({
            customerId: newOrderCustomer,
            items: newOrderItems
        });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h1">Operazioni in Uscita</Typography>
                <Button variant="contained" onClick={() => { setOpenCreateDialog(true); setCreateError(null); }}>Crea Ordine</Button>
            </Box>

            <Typography variant="h2" gutterBottom>Ordini Attivi</Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Rif. Ordine</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Stato</TableCell>
                            <TableCell>Creato Il</TableCell>
                            <TableCell>Azioni</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders?.map((order: any) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.orderNumber}</TableCell>
                                <TableCell>{order.customerId}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.status}
                                        color={
                                            order.status === 'SHIPPED' ? 'success' :
                                                order.status === 'PICKED' ? 'info' :
                                                    order.status === 'PICKING' ? 'warning' : 'default'
                                        }
                                        variant="filled" // Changed to filled for visibility
                                    />
                                </TableCell>
                                <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="secondary"
                                        disabled={order.status !== 'PICKED' || shipOrderMutation.isPending}
                                        onClick={() => handleShip(order.id)}
                                    >
                                        Spedisci
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!orders || orders.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Nessun ordine attivo</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h2" gutterBottom>Attività di Prelievo</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID Attività</TableCell>
                            <TableCell>Rif. Ordine</TableCell>
                            <TableCell>Articolo</TableCell>
                            <TableCell>Posizione</TableCell>
                            <TableCell>Qta</TableCell>
                            <TableCell>Azione</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks?.map((task: any) => (
                            <TableRow key={task.id}>
                                <TableCell>{task.id.substring(0, 8)}...</TableCell>
                                <TableCell>{task.orderId}</TableCell>
                                <TableCell>{task.itemCode}</TableCell>
                                <TableCell>{task.locationCode}</TableCell>
                                <TableCell>{task.targetQuantity}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => handleConfirm(task.id)}
                                        disabled={confirmTaskMutation.isPending}
                                    >
                                        Conferma Prelievo
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!tasks || tasks.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Nessuna attività di prelievo in sospeso</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Crea Ordine in Uscita</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {createError && (
                            <Alert severity="error" onClose={() => setCreateError(null)}>
                                {createError}
                            </Alert>
                        )}
                        <TextField
                            label="Nome Cliente"
                            fullWidth
                            value={newOrderCustomer}
                            onChange={(e) => setNewOrderCustomer(e.target.value)}
                        />

                        <Typography variant="h6">Articoli</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <ItemAutocomplete
                                    value={tempItemCode}
                                    onChange={(val) => {
                                        setTempItemCode(val);
                                        // Reset selection when item changes
                                        setTempSourceLocation('');
                                    }}
                                    label="Articolo"
                                />
                            </Box>
                            <TextField
                                label="Qta"
                                type="number"
                                sx={{ width: 100 }}
                                value={tempQty}
                                onChange={(e) => setTempQty(e.target.value)}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddItem}
                                disabled={!tempItemCode || !tempQty}
                            >
                                Aggiungi
                            </Button>
                        </Box>

                        {/* Stock Availability Table */}
                        {tempItemCode && (
                            <StockAvailabilityTable
                                itemCode={tempItemCode}
                                onSelectLocation={(locCode) => setTempSourceLocation(locCode)}
                                selectedLocation={tempSourceLocation}
                            />
                        )}

                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Articolo</TableCell>
                                        <TableCell>Quantità</TableCell>
                                        <TableCell>Da Posizione</TableCell>
                                        <TableCell width={50}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {newOrderItems.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.itemCode}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.sourceLocationCode || 'Qualsiasi'}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" onClick={() => handleRemoveItem(index)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {newOrderItems.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">Nessun articolo aggiunto</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)}>Annulla</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitOrder}
                        disabled={!newOrderCustomer || newOrderItems.length === 0 || createOrderMutation.isPending}
                    >
                        Crea Ordine
                    </Button>
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

// Helper Component for Stock Availability
function StockAvailabilityTable({ itemCode, onSelectLocation, selectedLocation }: { itemCode: string, onSelectLocation: (loc: string) => void, selectedLocation: string }) {
    const { data: stocks, isLoading } = useQuery({
        queryKey: ['stock-by-item', itemCode],
        queryFn: () => StockService.getStockByItem(itemCode),
        enabled: !!itemCode
    });

    if (isLoading) return <Typography variant="caption">Controllo giacenza...</Typography>;
    if (!stocks || stocks.length === 0) return <Typography variant="caption" color="error">Nessuna giacenza disponibile</Typography>;

    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="subtitle2">Giacenza Disponibile (Seleziona origine):</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 150 }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Posizione</TableCell>
                            <TableCell align="right">Qta</TableCell>
                            <TableCell align="center">Azione</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stocks.map((stock) => (
                            <TableRow key={stock.id} selected={stock.locationCode === selectedLocation}>
                                <TableCell>{stock.locationCode}</TableCell>
                                <TableCell align="right">{stock.quantity}</TableCell>
                                <TableCell align="center">
                                    <Button
                                        size="small"
                                        variant={stock.locationCode === selectedLocation ? "contained" : "outlined"}
                                        onClick={() => onSelectLocation(stock.locationCode)}
                                    >
                                        {stock.locationCode === selectedLocation ? "Selezionato" : "Seleziona"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
