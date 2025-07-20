const express = require('express');
const _ = require('lodash');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Blog = require('./models/blog');


const app = express()

app.set('view engine','ejs')

app.use(express.urlencoded({ extended : true}))

const dbURI = 'mongodb+srv://ali1387:a1l2i3m4.1387@ali.eqqidnd.mongodb.net/?retryWrites=true&w=majority&appName=Ali'

mongoose.connect(dbURI)
    .then((result)=> app.listen(3000))
    .catch((err)=> console.log(err))

app.use(express.static('public'))

