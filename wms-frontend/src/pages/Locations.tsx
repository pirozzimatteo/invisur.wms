import { useState, useMemo } from 'react';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, Button, DialogActions, TextField, Tooltip, Collapse, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useLocations } from '../hooks/useLocations';
import { StockService } from '../services/StockService';
import { locationService } from '../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StockDetail, Location } from '../types';

type LocationNode = Location & { children: LocationNode[] };

// Helper to build hierarchy
const buildHierarchy = (locations: Location[]) => {
    const map = new Map<string, LocationNode>();
    const roots: LocationNode[] = [];

    // Initialize map
    locations.forEach(loc => {
        // @ts-ignore - we know we are adding children
        map.set(loc.id, { ...loc, children: [] });
    });

    // Build tree
    locations.forEach(loc => {
        const node = map.get(loc.id)!;
        if (loc.parentId && map.has(loc.parentId)) {
            map.get(loc.parentId)!.children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
};

// Row Component for Collapsible Table
const Row = ({ row, onEdit, onView, onAddChild }: {
    row: LocationNode,
    onEdit: (loc: Location) => void,
    onView: (id: string) => void,
    onAddChild: (parent: Location) => void
}) => {
    const [open, setOpen] = useState(false);
    const hasChildren = row.children && row.children.length > 0;

    // Indentation based on type (visual cue)
    const getIndentation = (type: string) => {
        switch (type) {
            case 'SITE': return 0;
            case 'AREA': return 2;
            case 'AISLE': return 4;
            case 'BIN': return 6;
            default: return 0;
        }
    };

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: open ? 'action.hover' : 'inherit' }}>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: getIndentation(row.type) }}>
                        {hasChildren && (
                            <IconButton
                                aria-label="expand row"
                                size="small"
                                onClick={() => setOpen(!open)}
                            >
                                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                        )}
                        {!hasChildren && <Box sx={{ width: 28 }} />} {/* Spacer for alignment */}
                        <Box>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{row.code}</Typography>
                            {row.description && <Typography variant="caption" color="textSecondary">{row.description}</Typography>}
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                    <Chip
                        label={row.status}
                        color={row.status === 'FREE' ? 'success' : row.status === 'OCCUPIED' ? 'warning' : 'default'}
                        size="small"
                    />
                </TableCell>
                <TableCell align="right">
                    {row.currentVolume || 0} / {row.capacityVolume || '∞'}
                </TableCell>
                <TableCell align="center">
                    <Tooltip title="Visualizza Contenuto">
                        <IconButton onClick={() => onView(row.id)} color="primary" size="small">
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifica">
                        <IconButton onClick={() => onEdit(row)} color="default" size="small">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Aggiungi Sotto-Posizione">
                        <IconButton onClick={() => onAddChild(row)} color="secondary" size="small">
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table size="small" aria-label="sub-locations">
                            <TableBody>
                                {row.children.map((child) => (
                                    <Row
                                        key={child.id}
                                        row={child}
                                        onEdit={onEdit}
                                        onView={onView}
                                        onAddChild={onAddChild}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default function Locations() {
    const { data: locations, isLoading } = useLocations();
    const queryClient = useQueryClient();
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [locationContents, setLocationContents] = useState<StockDetail[]>([]);
    const [loadingContents, setLoadingContents] = useState(false);

    // Add/Edit State
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form Fields
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('AREA');
    const [parentId, setParentId] = useState<string>('');
    const [capacity, setCapacity] = useState('');

    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const treeData = useMemo(() => {
        if (!locations) return [];
        return buildHierarchy(locations);
    }, [locations]);

    const createMutation = useMutation({
        mutationFn: locationService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            handleCloseDialog();
            showMessage('Posizione creata con successo', 'success');
        },
        onError: (error: any) => {
            showMessage(error.response?.data?.message || 'Errore nella creazione della posizione', 'error');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => locationService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            handleCloseDialog();
            showMessage('Posizione aggiornata con successo', 'success');
        },
        onError: (error: any) => {
            showMessage(error.response?.data?.message || 'Errore nell\'aggiornamento della posizione', 'error');
        }
    });

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setIsEditMode(false);
        setEditingId(null);
        setCode('');
        setDescription('');
        setType('AREA');
        setParentId('');
        setCapacity('');
    };

    const handleOpenAdd = (parentLoc?: Location) => {
        setIsEditMode(false);
        setCode('');
        setDescription('');
        setCapacity('');

        if (parentLoc) {
            setParentId(parentLoc.id);
            // Auto-suggest type based on parent
            if (parentLoc.type === 'SITE') setType('AREA');
            else if (parentLoc.type === 'AREA') setType('AISLE');
            else if (parentLoc.type === 'AISLE') setType('BIN');
            else setType('BIN');
        } else {
            setParentId('');
            setType('AREA'); // Default top level
        }

        setOpenDialog(true);
    };

    const handleOpenEdit = (loc: Location) => {
        setIsEditMode(true);
        setEditingId(loc.id);
        setCode(loc.code);
        setDescription(loc.description || '');
        setType(loc.type);
        setParentId(loc.parentId || '');
        setCapacity(loc.capacityVolume ? String(loc.capacityVolume) : '');
        setOpenDialog(true);
    };

    const handleSave = () => {
        const payload = {
            code,
            description,
            type,
            parentId: parentId || null,
            capacityVolume: capacity ? Number(capacity) : undefined
        };

        if (isEditMode && editingId) {
            updateMutation.mutate({ id: editingId, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleViewContent = async (locationId: string) => {
        setSelectedLocation(locationId);
        setLoadingContents(true);
        try {
            const contents = await StockService.getStockByLocation(locationId);
            setLocationContents(contents);
        } catch (error) {
            setLocationContents([]);
        } finally {
            setLoadingContents(false);
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h1" gutterBottom>Mappa Magazzino</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenAdd()}>
                    Aggiungi Posizione Radice
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Gerarchia Posizioni</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Stato</TableCell>
                            <TableCell align="right">Utilizzo (Vol/Cap)</TableCell>
                            <TableCell align="center">Azione</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {treeData.map((row) => (
                            <Row
                                key={row.id}
                                row={row}
                                onEdit={handleOpenEdit}
                                onView={handleViewContent}
                                onAddChild={handleOpenAdd}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Content Dialog */}
            <Dialog open={!!selectedLocation} onClose={() => setSelectedLocation(null)} maxWidth="md" fullWidth>
                <DialogTitle>Contenuto Posizione</DialogTitle>
                <DialogContent>
                    {loadingContents ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Codice Articolo</TableCell>
                                        <TableCell align="right">Quantità</TableCell>
                                        <TableCell>Stato</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {locationContents.map((stock) => (
                                        <TableRow key={stock.id}>
                                            <TableCell>{stock.itemCode}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{stock.quantity}</TableCell>
                                            <TableCell>{stock.status}</TableCell>
                                        </TableRow>
                                    ))}
                                    {locationContents.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">Posizione Vuota</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedLocation(null)}>Chiudi</Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{isEditMode ? 'Modifica Posizione' : 'Aggiungi Posizione'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
                        <TextField
                            label="Codice"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            helperText="Identificatore univoco es. AISLE-A-01"
                            fullWidth
                            disabled={isEditMode}
                        />
                        <TextField
                            label="Descrizione"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={type}
                                label="Tipo"
                                onChange={(e) => setType(e.target.value)}
                            >
                                <MenuItem value="SITE">Sito</MenuItem>
                                <MenuItem value="AREA">Area (Zona)</MenuItem>
                                <MenuItem value="AISLE">Corsia</MenuItem>
                                <MenuItem value="RACK">Scaffale</MenuItem>
                                <MenuItem value="LEVEL">Livello</MenuItem>
                                <MenuItem value="BIN">Cella</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Posizione Genitore</InputLabel>
                            <Select
                                value={parentId}
                                label="Posizione Genitore"
                                onChange={(e) => setParentId(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value=""><em>Nessuna (Radice)</em></MenuItem>
                                {locations?.map((l: Location) => (
                                    <MenuItem key={l.id} value={l.id}>
                                        {l.code} ({l.type})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Volume Capacità"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            type="number"
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Annulla</Button>
                    <Button variant="contained" onClick={handleSave} disabled={!code}>
                        {isEditMode ? 'Salva' : 'Crea'}
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
        </Box >
    );
}
