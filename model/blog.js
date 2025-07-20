const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    snippet: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    persianDate: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true 
    }
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
