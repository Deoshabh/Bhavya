// For site settings
const settingSchema = new mongoose.Schema({
    key: String,
    value: mongoose.Schema.Types.Mixed,
    category: String
}); 