import { useState, useMemo } from 'react';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, Button, DialogActions, TextField, Tooltip, Collapse, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
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
                    <Tooltip title="View Contents">
                        <IconButton onClick={() => onView(row.id)} color="primary" size="small">
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton onClick={() => onEdit(row)} color="default" size="small">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Sub-Location">
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

    const treeData = useMemo(() => {
        if (!locations) return [];
        return buildHierarchy(locations);
    }, [locations]);

    const createMutation = useMutation({
        mutationFn: locationService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            handleCloseDialog();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => locationService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            handleCloseDialog();
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
                <Typography variant="h1" gutterBottom>Warehouse Map</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenAdd()}>
                    Add Root Location
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Location Hierarchy</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Usage (Vol/Cap)</TableCell>
                            <TableCell align="center">Action</TableCell>
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
                <DialogTitle>Location Contents</DialogTitle>
                <DialogContent>
                    {loadingContents ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item Code</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell>Status</TableCell>
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
                                            <TableCell colSpan={3} align="center">Empty Location</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedLocation(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{isEditMode ? 'Edit Location' : 'Add Location'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
                        <TextField
                            label="Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            helperText="Unique identifier e.g. AISLE-A-01"
                            fullWidth
                            disabled={isEditMode}
                        />
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={type}
                                label="Type"
                                onChange={(e) => setType(e.target.value)}
                            >
                                <MenuItem value="SITE">Site</MenuItem>
                                <MenuItem value="AREA">Area (Zone)</MenuItem>
                                <MenuItem value="AISLE">Aisle</MenuItem>
                                <MenuItem value="RACK">Rack</MenuItem>
                                <MenuItem value="LEVEL">Level</MenuItem>
                                <MenuItem value="BIN">Bin</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Parent Location</InputLabel>
                            <Select
                                value={parentId}
                                label="Parent Location"
                                onChange={(e) => setParentId(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value=""><em>None (Root)</em></MenuItem>
                                {locations?.map((l: Location) => (
                                    <MenuItem key={l.id} value={l.id}>
                                        {l.code} ({l.type})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Capacity Volume"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            type="number"
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={!code}>
                        {isEditMode ? 'Save' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
