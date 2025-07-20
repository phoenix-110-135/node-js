const express = require('express');
const _ = require('lodash');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Blog = require('./model/blog');
const multer = require('multer');
const path = require('path');
const app = express()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // نام فایل
    }
});

const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.set('view engine','ejs')



const dbURI = 'mongodb+srv://ali1387:a1l2i3m4.1387@ali.eqqidnd.mongodb.net/?retryWrites=true&w=majority&appName=Ali'

mongoose.connect(dbURI)
    .then((result)=> app.listen(3000))
    .catch((err)=> console.log(err))

app.use(express.static('public'))


app.get('/add-blog' , (req, res) => {

    const blog = new Blog(req.body)

    blog.save()
        .then((result) => res.send(result))
        .catch((err) => console.log(err))
})


app.get('/all-blog' , (req, res) => {
    Blog.find()
    .then((result)=> res.send(result))
    .catch((err)=> res.send(err))
})

app.get('/delete-all-blogs', (req, res) => {
    Blog.deleteMany({})
        .then((result) => {
            res.send({ message: 'All blogs deleted successfully' });
        })
        .catch((err) => res.send(err));
})

app.post('/blogs', upload.single('image'), (req, res) => {
    const newBlog = new Blog({
        title: req.body.title,
        snippet: req.body.snippet,
        body: req.body.body,
        image: req.file.path,    
        persianDate: req.body.persianDate
    });

    newBlog.save()
        .then((result) => {
            res.redirect('/blogs');
        })
        .catch((err) => console.log(err));
    
    console.log(req.body);
});

app.get('/', (req, res)=>{
    res.render('index', {title : 'Home'})
})

app.use(morgan('tiny'))


app.get('/about', (req, res)=>{
    res.render('about', {
        title : 'About Us',
    });
})

app.get('/blogs', (req, res) => {
    Blog.find()  
        .then((result) => {
            res.render('blog-home', { blogs: result }); // ارسال پست‌ها به view
        })
        .catch((err) => console.log(err));
});

app.get('/blogs/:id', (req, res) => {
    const id = req.params.id; 
    Blog.findById(id) 
        .then((result) => {
            if (result) {
                res.render('blog-single', { blog: result }); // ارسال پست به view
            } else {
                res.status(404).render('404', { title: 'Post Not Found' }); // اگر پست پیدا نشد
            }
        })
        .catch((err) => console.log(err));
});
app.get('/send',(req,res)=>{
    res.render('send')
})

app.get('/about-us', (req, res)=>{
    res.redirect('/about');
})

app.use((req, res)=>{
    res.render('404', {title : '404 - Page Not Found'})
})