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
    CircularProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { itemService } from '../services/api';
import type { Item } from '../types';

export default function Items() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [newItem, setNewItem] = useState({
        internalCode: '',
        description: '',
        category: '',
        unitOfMeasure: '',
        reorderPoint: 10
    });

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await itemService.getAll();
            setItems(response.data);
        } catch (err) {
            setError('Impossibile recuperare gli articoli');
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
            setError('Compilare i campi obbligatori (Codice, Descrizione, U.d.M.)');
            return;
        }
        try {
            await itemService.create(newItem);
            setOpenDialog(false);
            setNewItem({ internalCode: '', description: '', category: '', unitOfMeasure: '', reorderPoint: 10 });
            fetchItems();
        } catch (err) {
            console.error('Errore creazione articolo', err);
            setError('Impossibile creare l\'articolo');
        }
    };

    const handleEditClick = (item: Item) => {
        setEditingItem(item);
        setEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingItem) return;
        try {
            await itemService.update(editingItem.id, {
                description: editingItem.description,
                category: editingItem.category,
                unitOfMeasure: editingItem.unitOfMeasure,
                reorderPoint: editingItem.reorderPoint
            });
            setEditDialogOpen(false);
            setEditingItem(null);
            fetchItems();
        } catch (err) {
            console.error("Errore aggiornamento articolo", err);
            setError("Errore nell'aggiornamento articolo");
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Articoli</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Aggiungi Articolo
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Codice</TableCell>
                            <TableCell>Descrizione</TableCell>
                            <TableCell>Categoria</TableCell>
                            <TableCell>U.d.M.</TableCell>
                            <TableCell>Punto di Riordino</TableCell>
                            <TableCell>Azioni</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Nessun articolo trovato.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>{item.internalCode}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.unitOfMeasure}</TableCell>
                                    <TableCell>{item.reorderPoint}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Modifica">
                                            <IconButton onClick={() => handleEditClick(item)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Aggiungi Nuovo Articolo</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Codice Interno (SKU)"
                            value={newItem.internalCode}
                            onChange={(e) => setNewItem({ ...newItem, internalCode: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Descrizione"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Categoria"
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Unità di Misura (es. PZ, KG)"
                            value={newItem.unitOfMeasure}
                            onChange={(e) => setNewItem({ ...newItem, unitOfMeasure: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Punto di Riordino (Soglia Scorta Minima)"
                            type="number"
                            value={newItem.reorderPoint}
                            onChange={(e) => setNewItem({ ...newItem, reorderPoint: Number(e.target.value) })}
                            fullWidth
                            helperText="Predefinito è 10 se non specificato"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Annulla</Button>
                    <Button onClick={handleCreate} variant="contained">Crea</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Modifica Articolo</DialogTitle>
                <DialogContent>
                    {editingItem && (
                        <Box sx={{ pt: 2 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <TextField
                                    label="Codice (Non modificabile)"
                                    value={editingItem.internalCode}
                                    disabled
                                    fullWidth
                                />
                                <TextField
                                    label="Categoria"
                                    value={editingItem.category}
                                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                    fullWidth
                                />
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <TextField
                                        label="Descrizione"
                                        value={editingItem.description}
                                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                        fullWidth
                                    />
                                </div>
                                <TextField
                                    label="Unità di Misura"
                                    value={editingItem.unitOfMeasure}
                                    onChange={(e) => setEditingItem({ ...editingItem, unitOfMeasure: e.target.value })}
                                    fullWidth
                                />
                                <TextField
                                    label="Punto di Riordino"
                                    type="number"
                                    value={editingItem.reorderPoint}
                                    onChange={(e) => setEditingItem({ ...editingItem, reorderPoint: Number(e.target.value) })}
                                    fullWidth
                                />
                            </div>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Annulla</Button>
                    <Button onClick={handleUpdate} variant="contained">Salva</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
