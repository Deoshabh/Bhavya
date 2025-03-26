import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../services/api';

const TicketManagement = ({ eventId, onUpdate }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalTickets, setTotalTickets] = useState(0);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, [eventId, page, rowsPerPage, search, status]);

    const fetchTickets = async () => {
        try {
            const response = await api.get(`/admin/events/${eventId}/tickets`, {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    search,
                    status: status !== 'all' ? status : undefined
                }
            });
            setTickets(response.data.tickets);
            setTotalTickets(response.data.total);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await api.put(`/admin/tickets/${ticketId}/status`, { status: newStatus });
            fetchTickets();
            onUpdate();
        } catch (error) {
            console.error('Error updating ticket status:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    label="Search Tickets"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 300 }}
                    InputProps={{
                        endAdornment: <SearchIcon color="action" />
                    }}
                />
                <FormControl size="small" sx={{ width: 200 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={status}
                        label="Status"
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <MenuItem value="all">All Tickets</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ticket ID</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Purchase Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.map((ticket) => (
                            <TableRow key={ticket._id}>
                                <TableCell>{ticket._id}</TableCell>
                                <TableCell>{ticket.user.name}</TableCell>
                                <TableCell>{ticket.type}</TableCell>
                                <TableCell>₹{ticket.price}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={ticket.status}
                                        color={getStatusColor(ticket.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            setSelectedTicket(ticket);
                                            setOpenDialog(true);
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={totalTickets}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Update Ticket Status</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={selectedTicket?.status || ''}
                            label="Status"
                            onChange={(e) => {
                                handleStatusChange(selectedTicket._id, e.target.value);
                                setOpenDialog(false);
                            }}
                        >
                            <MenuItem value="confirmed">Confirmed</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TicketManagement; 