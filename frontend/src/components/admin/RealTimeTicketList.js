import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Checkbox,
    Typography,
    Button
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    GetApp as ExportIcon
} from '@mui/icons-material';
import { useWebSocket } from '../../context/WebSocketContext';
import AdvancedFilter from './AdvancedFilter';
import api from '../../services/api';
import BulkOperations from './BulkOperations';

const filterFields = [
    { key: 'status', label: 'Status', type: 'SELECT', options: [
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' }
    ]},
    { key: 'purchaseDate', label: 'Purchase Date', type: 'DATE' },
    { key: 'price', label: 'Price', type: 'NUMBER' },
    { key: 'userName', label: 'User Name', type: 'TEXT' },
    { key: 'userEmail', label: 'User Email', type: 'TEXT' }
];

const RealTimeTicketList = ({ eventId }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const { subscribe, unsubscribe, addMessageHandler } = useWebSocket();
    const [selectedTickets, setSelectedTickets] = useState([]);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/events/${eventId}/tickets`, {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    filters: JSON.stringify(filters)
                }
            });
            setTickets(response.data.tickets);
            setTotalCount(response.data.total);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    }, [eventId, page, rowsPerPage, filters]);

    useEffect(() => {
        subscribe(eventId);
        
        const unsubscribeHandler = addMessageHandler('TICKET_UPDATE', (data) => {
            setTickets(prevTickets => {
                const ticketIndex = prevTickets.findIndex(t => t._id === data._id);
                if (ticketIndex === -1) return prevTickets;

                const newTickets = [...prevTickets];
                newTickets[ticketIndex] = data;
                return newTickets;
            });
        });

        return () => {
            unsubscribe(eventId);
            unsubscribeHandler();
        };
    }, [eventId, subscribe, unsubscribe, addMessageHandler]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleExport = async () => {
        try {
            const response = await api.get(`/admin/events/${eventId}/tickets/export`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `tickets-${eventId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting tickets:', error);
        }
    };

    const handleSelectAll = useCallback((event) => {
        if (event.target.checked) {
            setSelectedTickets(tickets);
        } else {
            setSelectedTickets([]);
        }
    }, [tickets]);

    const handleSelectTicket = useCallback((ticket) => {
        setSelectedTickets(prev => {
            const isSelected = prev.find(t => t._id === ticket._id);
            if (isSelected) {
                return prev.filter(t => t._id !== ticket._id);
            }
            return [...prev, ticket];
        });
    }, []);

    const isAllSelected = useMemo(() => {
        return tickets.length > 0 && selectedTickets.length === tickets.length;
    }, [tickets.length, selectedTickets.length]);

    class ErrorBoundary extends React.Component {
        constructor(props) {
            super(props);
            this.state = { hasError: false };
        }

        static getDerivedStateFromError(error) {
            return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
            console.error('TicketList Error:', error, errorInfo);
        }

        render() {
            if (this.state.hasError) {
                return (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="error">
                            Something went wrong. Please try refreshing the page.
                        </Typography>
                        <Button
                            onClick={() => window.location.reload()}
                            sx={{ mt: 2 }}
                        >
                            Refresh Page
                        </Button>
                    </Box>
                );
            }

            return this.props.children;
        }
    }

    return (
        <ErrorBoundary>
            <Box>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <AdvancedFilter
                            fields={filterFields}
                            onFilterChange={setFilters}
                        />
                        <BulkOperations
                            eventId={eventId}
                            selectedTickets={selectedTickets}
                            onOperationComplete={() => {
                                setSelectedTickets([]);
                                fetchTickets();
                            }}
                            disabled={loading}
                        />
                    </Box>
                    <Box>
                        <Tooltip title="Refresh">
                            <IconButton onClick={fetchTickets} disabled={loading}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Export">
                            <IconButton onClick={handleExport} disabled={loading}>
                                <ExportIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        disabled={loading}
                                    />
                                </TableCell>
                                {/* ... other header cells ... */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <CircularProgress size={40} />
                                    </TableCell>
                                </TableRow>
                            ) : tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No tickets found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket) => (
                                    <TableRow
                                        key={ticket._id}
                                        selected={selectedTickets.some(t => t._id === ticket._id)}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedTickets.some(t => t._id === ticket._id)}
                                                onChange={() => handleSelectTicket(ticket)}
                                            />
                                        </TableCell>
                                        {/* ... other cells ... */}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={totalCount}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </TableContainer>
            </Box>
        </ErrorBoundary>
    );
};

export default RealTimeTicketList; 