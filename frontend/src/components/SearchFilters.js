import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CategoryService from '../services/categoryService';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const SearchFilters = ({ onFilter }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        city: '',
        dateRange: {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        },
        priceRange: {
            min: '',
            max: ''
        },
        tags: []
    });

    useEffect(() => {
        fetchCategories();
        fetchPopularTags();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await CategoryService.getCategories();
            setCategories(response);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchPopularTags = async () => {
        try {
            const response = await CategoryService.getPopularTags();
            setPopularTags(response);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSearch = () => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && (typeof value === 'string' || Array.isArray(value))) {
                queryParams.set(key, Array.isArray(value) ? value.join(',') : value);
            }
        });
        
        navigate({
            pathname: location.pathname,
            search: queryParams.toString()
        });

        if (onFilter) {
            onFilter(filters);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-4">
                {/* Search Input */}
                <div>
                    <input
                        type="text"
                        placeholder="Search exhibitions..."
                        className="w-full px-4 py-2 border rounded-lg"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                {/* Category Filter */}
                <div>
                    <select
                        className="w-full px-4 py-2 border rounded-lg"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* City Filter */}
                <div>
                    <input
                        type="text"
                        placeholder="Enter city..."
                        className="w-full px-4 py-2 border rounded-lg"
                        value={filters.city}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                    />
                </div>

                {/* Date Range Filter */}
                <div>
                    <DateRangePicker
                        ranges={[filters.dateRange]}
                        onChange={item => handleFilterChange('dateRange', item.selection)}
                        minDate={new Date()}
                    />
                </div>

                {/* Price Range Filter */}
                <div className="flex space-x-4">
                    <input
                        type="number"
                        placeholder="Min price"
                        className="w-1/2 px-4 py-2 border rounded-lg"
                        value={filters.priceRange.min}
                        onChange={(e) => handleFilterChange('priceRange', {
                            ...filters.priceRange,
                            min: e.target.value
                        })}
                    />
                    <input
                        type="number"
                        placeholder="Max price"
                        className="w-1/2 px-4 py-2 border rounded-lg"
                        value={filters.priceRange.max}
                        onChange={(e) => handleFilterChange('priceRange', {
                            ...filters.priceRange,
                            max: e.target.value
                        })}
                    />
                </div>

                {/* Popular Tags */}
                <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                        <button
                            key={tag._id}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filters.tags.includes(tag._id)
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                            onClick={() => {
                                const newTags = filters.tags.includes(tag._id)
                                    ? filters.tags.filter(t => t !== tag._id)
                                    : [...filters.tags, tag._id];
                                handleFilterChange('tags', newTags);
                            }}
                        >
                            {tag._id} ({tag.count})
                        </button>
                    ))}
                </div>

                {/* Apply Filters Button */}
                <button
                    onClick={handleSearch}
                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default SearchFilters; 