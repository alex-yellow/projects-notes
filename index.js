const express = require('express');
const exphbs = require('express-handlebars');
const cookieparser = require('cookie-parser');
const expsession = require('express-session');
const db = require('./db');

const app = express();
const PORT = 3000;

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

const secret = 'asd';
app.use(cookieparser(secret));
app.use(expsession({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 2000
    }
}));

app.get('/', function(req, res){
    const sqlSel = 'SELECT * FROM projects';
    db.query(sqlSel, function(error, projects, fields){
        if(error) throw error;
        if(projects){
            res.render('projects', {title:'Projects', projects});
        }
        else{
            res.render('error', {title:'Projects not found', text:'Projects not found'});
        }
    });
});

app.get('/add-project', function(req, res){
    res.render('add-project', {title:'Add project'});
});

app.post('/add-project', function(req, res){
    const name = req.body.name;
    const sqlAdd = 'INSERT INTO projects (name) VALUES (?)';
    if(name != undefined && name != null){
        db.query(sqlAdd, [name], function(error, result, fields){
            if(error) throw error;
            req.session.add = `Project ${name} added success!`;
            res.redirect('/');
        });
    }
    else{
        res.render('error', {title:'Project is null', text:'Project is null'});
    }
});


app.use(function(req, res){
    res.render('error', {title:'Not found', text:'Not found'});
});

app.listen(PORT, function(){
    console.log('Server is rinning on port: ' + PORT);
});