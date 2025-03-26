import React from 'react';
import { Paper, InputBase, IconButton, Box } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const SearchBar = ({ onSearch, placeholder = "Search...", value, onChange }) => {
    const handleClear = () => {
        onChange('');
        onSearch('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(value);
    };

    return (
        <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                mb: 2
            }}
        >
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <IconButton onClick={handleClear} size="small">
                    <ClearIcon />
                </IconButton>
            )}
            <IconButton type="submit" sx={{ p: '10px' }}>
                <SearchIcon />
            </IconButton>
        </Paper>
    );
};

export default SearchBar; 