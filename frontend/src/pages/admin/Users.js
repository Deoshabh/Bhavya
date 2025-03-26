import React, { useState, useEffect, useCallback } from 'react';
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
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';
import {
    Block as BlockIcon,
    CheckCircle as ActiveIcon,
    Delete as DeleteIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import api from '../../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [search, setSearch] = useState('');
    const [userType, setUserType] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    search,
                    userType: userType !== 'all' ? userType : undefined
                }
            });
            setUsers(response.data.users);
            setTotalUsers(response.data.total);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, search, userType]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await api.put(`/admin/users/${userId}/status`, { status: newStatus });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
            setOpenDialog(false);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleSearch = (event) => {
        setSearch(event.target.value);
        setPage(0);
    };

    const handleUserTypeChange = (event) => {
        setUserType(event.target.value);
        setPage(0);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                User Management
            </Typography>

            {/* Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    label="Search Users"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={handleSearch}
                    sx={{ width: 300 }}
                    InputProps={{
                        endAdornment: <SearchIcon color="action" />
                    }}
                />
                <FormControl size="small" sx={{ width: 200 }}>
                    <InputLabel>User Type</InputLabel>
                    <Select
                        value={userType}
                        label="User Type"
                        onChange={handleUserTypeChange}
                    >
                        <MenuItem value="all">All Users</MenuItem>
                        <MenuItem value="visitor">Visitors</MenuItem>
                        <MenuItem value="exhibitor">Exhibitors</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Users Table */}
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Joined Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.userType}
                                        color={user.userType === 'exhibitor' ? 'primary' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.status}
                                        color={user.status === 'active' ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleStatusChange(
                                            user._id,
                                            user.status === 'active' ? 'inactive' : 'active'
                                        )}
                                    >
                                        {user.status === 'active' ? <BlockIcon /> : <ActiveIcon />}
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setOpenDialog(true);
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={totalUsers}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete user {selectedUser?.name}?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={() => handleDeleteUser(selectedUser?._id)}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users; 