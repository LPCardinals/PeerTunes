if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const path = require('path');
const app = express();
const port = 3000

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const usrs = [ ]

const createPassport = require('./public/JS/passportConfig')
createPassport(
    passport,
    email => usrs.find(user => user.email === email),
    id => usrs.find(user => user.id === id)
)

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}))

app.use(flash())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', (req, res) => res.render('login.ejs'))  
// app.post('/login', (req,res) =>{
// })

app.get('/peerTunes', (req, res) => res.render('peerTunes.ejs')) 


app.use(express.static(path.join(__dirname, 'images')));

app.listen(port);
console.log('Server is listening on Port ' + (port));

app.get('/', checkAuthenticated, (req,res) =>{

})

app.get('/login', checkNotAuthenticated, (req,res) =>{
    res.render('login.ejs');
})

app.use(express.static('public'))
app.use('/css',express.static(__dirname + 'public/CSS'))
app.use('/js',express.static(__dirname + 'public/JS'))

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/peerTunes',
    failureRedirect: '/login',
    failureFlash: true
}))


// app.post('/register', (req,res) =>{
//     req.body.email
    
// })

app.get('/register', checkNotAuthenticated, (req,res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async(req,res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 8)  
      usrs.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      res.redirect('/login')
    } catch(error){
        console.error(error)
        res.redirect('/register')
    }

})

app.delete('/logout', (req,res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}