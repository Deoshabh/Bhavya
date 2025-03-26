const mongoosePaginate = require('mongoose-paginate-v2');

module.exports = (schema) => {
    schema.plugin(mongoosePaginate);
};