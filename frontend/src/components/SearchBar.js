import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, InputBase, Paper } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/events?search=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
            setIsExpanded(false);
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        setIsExpanded(false);
    };

    return (
        <Paper
            component="form"
            onSubmit={handleSearch}
            sx={{
                p: { xs: '2px', sm: '2px 4px' },
                display: 'flex',
                alignItems: 'center',
                width: { xs: '100%', sm: isExpanded ? 300 : 200 },
                transition: 'width 0.3s',
                borderRadius: '20px',
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                '&:hover': {
                    border: '1px solid #bdbdbd'
                }
            }}
        >
            <IconButton 
                type="submit" 
                sx={{ p: { xs: '8px', sm: '10px' } }} 
                aria-label="search"
                size="medium"
            >
                <SearchIcon fontSize="small" />
            </IconButton>
            <InputBase
                sx={{ 
                    ml: 1, 
                    flex: 1,
                    fontSize: { xs: '0.9rem', sm: '1rem' } 
                }}
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                onBlur={() => !searchTerm && setIsExpanded(false)}
                inputProps={{ 'aria-label': 'search events' }}
            />
            {searchTerm && (
                <IconButton 
                    sx={{ p: { xs: '8px', sm: '10px' } }} 
                    aria-label="clear search"
                    onClick={handleClear}
                    size="medium"
                >
                    <ClearIcon fontSize="small" />
                </IconButton>
            )}
        </Paper>
    );
};

export default SearchBar;