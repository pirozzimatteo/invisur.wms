import { useState } from 'react';
import {
    Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useQuery } from '@tanstack/react-query';
import { StockService } from '../services/StockService';

function InventoryRow({ row }: { row: any }) {
    const [open, setOpen] = useState(false);

    const { data: details, isLoading } = useQuery({
        queryKey: ['stock-details', row.itemCode],
        queryFn: () => StockService.getStockByItem(row.itemCode),
        enabled: open // Only fetch when expanded
    });

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    {row.itemCode}
                </TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell align="right" sx={{ fontSize: '1.2em' }}>{row.totalQuantity}</TableCell>
                <TableCell align="right">{row.locationsCount}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Location Details
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Location</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={3}>Loading details...</TableCell>
                                        </TableRow>
                                    ) : details && details.length > 0 ? (
                                        details.map((detail: any) => (
                                            <TableRow key={detail.id}>
                                                <TableCell component="th" scope="row">
                                                    {detail.locationCode}
                                                </TableCell>
                                                <TableCell align="right">{detail.quantity}</TableCell>
                                                <TableCell>{detail.status}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3}>No details available.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function Inventory() {
    const { data: inventory } = useQuery({
        queryKey: ['inventory'],
        queryFn: StockService.getInventorySummary
    });

    return (
        <Box>
            <Typography variant="h1" gutterBottom>Inventory Summary</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width={50} />
                            <TableCell>Item Code</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Total Qty</TableCell>
                            <TableCell align="right">Locations</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {inventory?.map((row) => (
                            <InventoryRow key={row.itemCode} row={row} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
