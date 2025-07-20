const express = require('express');
const slugify = require('slugify');
const _ = require('lodash');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Blog = require('./model/blog');
const multer = require('multer');
const path = require('path');
const app = express()
const fs = require('fs')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
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
            const uploadsDir = path.join(__dirname, 'uploads');

            fs.readdir(uploadsDir, (err, files) => {
                if (err) {
                    console.error('خطا در خواندن پوشه uploads:', err);
                    return res.status(500).send({ message: 'خطا در پاک کردن فایل‌ها' });
                }

                // حذف هر فایل به صورت جداگانه
                files.forEach(file => {
                    const filePath = path.join(uploadsDir, file);
                    fs.unlink(filePath, err => {
                        if (err) console.error('خطا در حذف فایل:', filePath, err);
                    });
                });

                res.send({ message: 'تمام بلاگ‌ها و تصاویر مربوطه حذف شدند.' });
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send({ message: 'خطا در حذف بلاگ‌ها' });
        });
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/blogs', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image uploaded');
    }
    const imagePath = '/uploads/' + req.file.filename;

    const newBlog = new Blog({
        title: req.body.title,
        snippet: req.body.snippet,
        body: req.body.body,
        image: imagePath,
        persianDate: req.body.persianDate,
        category: req.body.category,
        slug: slugify(req.body.title, { lower: true })
    });

    newBlog.save()
        .then(() => res.redirect('/blogs'))
        .catch(err => console.log(err));
});


app.get('/index', (req, res)=>{
    res.render('index', {title : 'Home'})
})
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
app.get('/blogs/:slug', (req, res) => {
    const slug = req.params.slug; 
    Blog.findOne({ slug: slug })  
        .then((result) => {
            if (result) {
                res.render('blog-single', { blog: result });
            } else {
                res.status(404).render('404', { title: 'Post Not Found' });
            }
        })
        .catch((err) => console.log(err));
});


app.get('/send',(req,res)=>{
    res.render('send')
})

app.get('/blogs/edit/slug/:slug', (req, res) => {
    const slug = req.params.slug;
    Blog.findOne({ slug: slug })
        .then(blog => {
            if (!blog) {
                return res.status(404).render('404', { title: 'Post Not Found' });
            }
            res.render('edit-blog', { blog });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Error retrieving blog');
        });
});


app.post('/blogs/edit/:slug', upload.single('image'), (req, res) => {
    const slug = req.params.slug;

    Blog.findOne({ slug: slug })
        .then(blog => {
            if (!blog) {
                return res.status(404).render('404', { title: 'Post Not Found' });
            }

            blog.title = req.body.title;
            blog.snippet = req.body.snippet;
            blog.body = req.body.body;
            blog.category = req.body.category;
            blog.slug = slugify(req.body.title, { lower: true });

            if (req.file) {
                blog.image = req.file.path;
            }

            return blog.save();
        })
        .then(() => {
            res.redirect('/blogs/' + slugify(req.body.title, { lower: true }));
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Error updating blog');
        });
});


app.get('/blog-single', (req, res) => {
    const dummyBlog = {
        title: "نمونه پست",
        image: "/uploads/sample.jpg",
        body: "محتوای تستی",
        snippet: "توضیح کوتاه"
    };
    res.render('blog-single', { blog: dummyBlog });
});


app.get('/elements',(req,res)=>{
    res.render('elements')
})

app.get('/contact',(req,res)=>{
    res.render('contact')
})

app.get('/about-us', (req, res)=>{
    res.redirect('/about');
})

app.get('/index', (req, res)=>{
    res.redirect('/');
})

app.use((req, res)=>{
    res.render('404', {title : '404 - Page Not Found'})
})