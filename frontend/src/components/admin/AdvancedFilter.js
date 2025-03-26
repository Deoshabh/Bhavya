import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    IconButton,
    Chip,
    Menu,
    MenuItem,
    Popover,
    Typography,
    Divider
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Add as AddIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { debounce } from 'lodash';

const FilterOperators = {
    TEXT: ['contains', 'equals', 'starts with', 'ends with'],
    NUMBER: ['equals', 'greater than', 'less than', 'between'],
    DATE: ['equals', 'after', 'before', 'between'],
    SELECT: ['equals', 'not equals', 'in']
};

export const AdvancedFilter = ({ 
    fields, 
    onFilterChange,
    initialFilters = [],
    maxFilters = 5
}) => {
    const [filters, setFilters] = useState(initialFilters);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const [operatorAnchorEl, setOperatorAnchorEl] = useState(null);

    // Memoize field definitions
    const fieldDefinitions = useMemo(() => {
        return fields.reduce((acc, field) => {
            acc[field.key] = field;
            return acc;
        }, {});
    }, [fields]);

    // Debounced filter change handler
    const debouncedFilterChange = useCallback(
        debounce((newFilters) => {
            onFilterChange(newFilters);
        }, 300),
        [onFilterChange]
    );

    const handleAddFilter = (field) => {
        if (filters.length >= maxFilters) return;

        const newFilter = {
            id: Date.now(),
            field: field.key,
            operator: FilterOperators[field.type][0],
            value: '',
            label: field.label
        };

        setFilters([...filters, newFilter]);
        setAnchorEl(null);
        setSelectedField(null);
    };

    const handleRemoveFilter = (filterId) => {
        const newFilters = filters.filter(f => f.id !== filterId);
        setFilters(newFilters);
        debouncedFilterChange(newFilters);
    };

    const handleFilterValueChange = (filterId, value) => {
        const newFilters = filters.map(filter => {
            if (filter.id === filterId) {
                return { ...filter, value };
            }
            return filter;
        });
        setFilters(newFilters);
        debouncedFilterChange(newFilters);
    };

    const renderFilterInput = (filter) => {
        const field = fieldDefinitions[filter.field];
        
        switch (field.type) {
            case 'TEXT':
                return (
                    <TextField
                        size="small"
                        value={filter.value}
                        onChange={(e) => handleFilterValueChange(filter.id, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'NUMBER':
                return (
                    <TextField
                        size="small"
                        type="number"
                        value={filter.value}
                        onChange={(e) => handleFilterValueChange(filter.id, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'DATE':
                return (
                    <DateRangePicker
                        value={filter.value}
                        onChange={(value) => handleFilterValueChange(filter.id, value)}
                    />
                );
            case 'SELECT':
                return (
                    <TextField
                        select
                        size="small"
                        value={filter.value}
                        onChange={(e) => handleFilterValueChange(filter.id, e.target.value)}
                    >
                        {field.options.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                );
            default:
                return null;
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button
                    startIcon={<FilterIcon />}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    disabled={filters.length >= maxFilters}
                >
                    Add Filter
                </Button>
                {filters.length > 0 && (
                    <Button
                        sx={{ ml: 2 }}
                        onClick={() => {
                            setFilters([]);
                            debouncedFilterChange([]);
                        }}
                    >
                        Clear All
                    </Button>
                )}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters.map(filter => (
                    <Chip
                        key={filter.id}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ mr: 1 }}>
                                    {filter.label}:
                                </Typography>
                                {renderFilterInput(filter)}
                            </Box>
                        }
                        onDelete={() => handleRemoveFilter(filter.id)}
                        sx={{ height: 'auto', p: 1 }}
                    />
                ))}
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {fields.map(field => (
                    <MenuItem
                        key={field.key}
                        onClick={() => handleAddFilter(field)}
                        disabled={filters.some(f => f.field === field.key)}
                    >
                        {field.label}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default AdvancedFilter; 