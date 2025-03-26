const Exhibition = require('../models/Exhibition');

class CategoryService {
    static categories = [
        'technology', 'business', 'art', 'science', 'other'
    ];

    static async getCategories() {
        return this.categories;
    }

    static async getCategoryStats() {
        const stats = await Exhibition.aggregate([
            { $match: { status: 'published' } },
            { $group: {
                _id: '$category',
                count: { $sum: 1 },
                averagePrice: { $avg: { $arrayElemAt: ['$tickets.price', 0] } }
            }},
            { $sort: { count: -1 } }
        ]);

        return stats;
    }

    static async getPopularTags(limit = 20) {
        const tags = await Exhibition.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$tags' },
            { $group: {
                _id: '$tags',
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        return tags;
    }
}

module.exports = CategoryService; 