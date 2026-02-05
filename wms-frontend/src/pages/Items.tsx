import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { itemService } from '../services/api';
import type { Item } from '../types';

export default function Items() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [newItem, setNewItem] = useState({
        internalCode: '',
        description: '',
        category: '',
        unitOfMeasure: ''
    });

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await itemService.getAll();
            setItems(response.data);
        } catch (err) {
            setError('Failed to fetch items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreate = async () => {
        if (!newItem.internalCode || !newItem.description || !newItem.unitOfMeasure) {
            // Simple client-side validation
            alert('Please fill in required fields (Code, Description, UoM)');
            return;
        }
        try {
            await itemService.create(newItem);
            setOpenDialog(false);
            setNewItem({
                internalCode: '',
                description: '',
                category: '',
                unitOfMeasure: ''
            });
            fetchItems();
        } catch (err) {
            console.error('Failed to create item', err);
            setError('Failed to create item');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Items</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Add Item
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>UoM</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>{item.internalCode}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.unitOfMeasure}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Internal Code (SKU)"
                            value={newItem.internalCode}
                            onChange={(e) => setNewItem({ ...newItem, internalCode: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Description"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Category"
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Unit of Measure (e.g. PCS, KG)"
                            value={newItem.unitOfMeasure}
                            onChange={(e) => setNewItem({ ...newItem, unitOfMeasure: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Reorder Point (Low Stock Threshold)"
                            type="number"
                            value={(newItem as any).reorderPoint || ''}
                            onChange={(e) => setNewItem({ ...newItem, reorderPoint: Number(e.target.value) } as any)}
                            fullWidth
                            helperText="Default is 10 if not specified"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
