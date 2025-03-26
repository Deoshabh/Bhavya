const Exhibition = require('../models/Exhibition');

class SearchService {
    static async searchExhibitions(params) {
        const {
            search,
            category,
            city,
            startDate,
            endDate,
            minPrice,
            maxPrice,
            tags,
            status,
            page = 1,
            limit = 10,
            sort = 'date.start'
        } = params;

        const query = { status: 'published' };

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Location filter
        if (city) {
            query['location.city'] = { $regex: new RegExp(city, 'i') };
        }

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.start = { $gte: new Date(startDate) };
            }
            if (endDate) {
                query.date.end = { $lte: new Date(endDate) };
            }
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query['tickets.price'] = {};
            if (minPrice) {
                query['tickets.price'].$gte = Number(minPrice);
            }
            if (maxPrice) {
                query['tickets.price'].$lte = Number(maxPrice);
            }
        }

        // Tags filter
        if (tags) {
            query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
        }

        // Execute search with pagination
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { [sort]: 1 },
            populate: {
                path: 'organizer',
                select: 'name email'
            }
        };

        return Exhibition.paginate(query, options);
    }
}

module.exports = SearchService; 