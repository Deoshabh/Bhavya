import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Alert,
    CircularProgress,
    Typography,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const BulkOperations = ({ 
    eventId, 
    selectedTickets, 
    onOperationComplete,
    disabled = false 
}) => {
    const [open, setOpen] = useState(false);
    const [operation, setOperation] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmation, setConfirmation] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    // Memoize available operations based on selected tickets
    const availableOperations = useMemo(() => {
        if (!selectedTickets.length) return [];

        const statuses = new Set(selectedTickets.map(ticket => ticket.status));
        
        const operations = [];
        if (statuses.has('pending')) {
            operations.push({ value: 'confirm', label: 'Confirm Tickets' });
        }
        if (statuses.has('confirmed') || statuses.has('pending')) {
            operations.push({ value: 'cancel', label: 'Cancel Tickets' });
        }
        if (statuses.has('cancelled')) {
            operations.push({ value: 'refund', label: 'Process Refunds' });
        }
        
        return operations;
    }, [selectedTickets]);

    const handleBulkOperation = useCallback(async () => {
        if (!confirmation) {
            enqueueSnackbar('Please confirm the operation', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const ticketIds = selectedTickets.map(ticket => ticket._id);
            const response = await api.post(`/admin/events/${eventId}/tickets/bulk-update`, {
                updates: {
                    operation,
                    reason,
                    ticketIds
                }
            }, {
                timeout: 30000 // Extended timeout for bulk operations
            });

            enqueueSnackbar(`Successfully processed ${response.data.processed} tickets`, {
                variant: 'success'
            });

            if (response.data.failed > 0) {
                enqueueSnackbar(`Failed to process ${response.data.failed} tickets`, {
                    variant: 'warning'
                });
            }

            onOperationComplete();
            setOpen(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to process bulk operation';
            enqueueSnackbar(errorMessage, { variant: 'error' });
            console.error('Bulk operation error:', error);
        } finally {
            setLoading(false);
            setConfirmation(false);
        }
    }, [eventId, selectedTickets, operation, reason, confirmation, enqueueSnackbar, onOperationComplete]);

    const handleClose = () => {
        if (loading) return;
        setOpen(false);
        setOperation('');
        setReason('');
        setConfirmation(false);
    };

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                onClick={() => setOpen(true)}
                disabled={disabled || !selectedTickets.length}
            >
                Bulk Operations ({selectedTickets.length})
            </Button>

            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { minHeight: '300px' }
                }}
            >
                <DialogTitle>
                    Bulk Operations
                    <Typography variant="subtitle2" color="text.secondary">
                        Selected: {selectedTickets.length} tickets
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Operation</InputLabel>
                            <Select
                                value={operation}
                                onChange={(e) => setOperation(e.target.value)}
                                label="Operation"
                                disabled={loading}
                            >
                                {availableOperations.map(op => (
                                    <MenuItem key={op.value} value={op.value}>
                                        {op.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Reason"
                            multiline
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={loading}
                            required
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={confirmation}
                                    onChange={(e) => setConfirmation(e.target.checked)}
                                    disabled={loading}
                                />
                            }
                            label="I confirm this bulk operation"
                        />

                        {operation && (
                            <Alert severity="info">
                                This operation will affect {selectedTickets.length} tickets.
                                {operation === 'cancel' && ' This action cannot be undone.'}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <LoadingButton
                        onClick={handleBulkOperation}
                        loading={loading}
                        disabled={!operation || !reason || !confirmation}
                        variant="contained"
                    >
                        Process
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default React.memo(BulkOperations); 