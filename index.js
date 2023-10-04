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
    db.query(sqlSel, function(error, projects){
        if(error) throw error;
        if(projects){
            res.render('projects', {title:'Projects', projects, add:req.session.add, edit:req.session.edit, delete:req.session.delete});
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
        db.query(sqlAdd, [name], function(error, result){
            if(error) throw error;
            req.session.add = `Project ${name} added success!`;
            res.redirect('/');
        });
    }
    else{
        res.render('error', {title:'Project is null', text:'Project is null'});
    }
});

app.get('/edit-project/:id', function(req, res){
    const id = req.params.id;
    const sqlFind = 'SELECT * FROM projects WHERE id=?';
    db.query(sqlFind, [id], function(error, projects){
        if(error) throw error;
        const project = projects[0];
        if(project){
            res.render('edit-project', {title: `Project ${project.name}`, project});
        }
        else{
            res.render('error', {title:'Project not found', text:'Project not found'});
        }
    });
});

app.post('/edit-project/:id', function(req, res){
    const id = req.params.id;
    const name = req.body.name;
    const sqlEdit = 'UPDATE projects SET name=? WHERE id=?';
    if(name != undefined && name != null){
        db.query(sqlEdit, [name, id], function(error, result){
            if(error) throw error;
            req.session.edit = `Project ${name} edit success!`;
            res.redirect('/');
        });
    }
    else{
        res.render('error', {title:'Project is null', text:'Project is null'});
    }
});

app.get('/delete-project/:id', function(req, res){
    const id = req.params.id;
    const sqlFind = 'SELECT * FROM projects WHERE id=?';
    db.query(sqlFind, [id], function(error, projects){
        if(error) throw error;
        const project = projects[0];
        if(project){
            const sqlDel = 'DELETE FROM projects WHERE id=?';
            db.query(sqlDel, [id], function(error, result){
                if(error) throw error;
                req.session.delete = `Project ${project.name} delete success!`;
                res.redirect('/');
            });
        }
        else{
            res.render('error', {title:'Project not found', text:'Project not found'});
        }
    });
});

app.get('/projects/:id/works', function(req, res){
    const id = req.params.id;
    const sqlFindProj = 'SELECT * FROM projects WHERE id=?';
    db.query(sqlFindProj, [id], function(error, projects){
        if(error) throw error;
        const project = projects[0];
        if(projects){
            const name = project.name;
            const sqlSelWorks = 'SELECT * FROM works WHERE project_id=?';
            db.query(sqlSelWorks, [id], function(error, works){
                if(error) throw error;
                if(works){
                    res.render('works', {title:`Works for project ${name}`, works, name, id, addWork:req.session.addWork, editWork:req.session.editWork, deleteWork:req.session.deleteWork, completeWork:req.session.completeWork});
                }
                else{
                    res.render('error', {title:'Works not found', text:'Works not found'});
                }
            });
        }
        else{
            res.render('error', {title:'Project not found', text:'Project not found'});
        }
    });
});

app.get('/projects/:id/works/add', function(req, res){
    const id = req.params.id;
    const sqlFindProj = 'SELECT * FROM projects WHERE id=?';
    db.query(sqlFindProj, [id], function(error, projects){
        if(error) throw error;
        const project = projects[0];
        if(projects){
            const name = project.name;
            res.render('add-work', {title:`Add work for project ${name}`, id});
        }
        else{
            res.render('error', {title:'Project not found', text:'Project not found'});
        }
    });
});

app.post('/projects/:id/works/add', function(req, res){
    const projectId = req.params.id;
    const name = req.body.name;
    const sqlAddWork = 'INSERT INTO works (name, project_id) VALUES(?,?)';
    if(name != undefined && name != null){
        db.query(sqlAddWork, [name, projectId], function(error, result){
            if(error) throw error;
            req.session.addWork = `Work ${name} add success!`;
            res.redirect(`/projects/${projectId}/works`);
        });
    }
    else{
        res.render('error', {title:'Work is null', text:'Work is null'});
    }

});

app.get('/works/:id/edit', function(req, res){
    const id = req.params.id;
    const sqlFindWork = 'SELECT * FROM works WHERE id=?';
    db.query(sqlFindWork, [id], function(error, works){
        if(error) throw error;
        const work = works[0];
        if(work){
            res.render('edit-work', {title:`Edit ${work.name}`, work, id:work.project_id});
        }
        else{
            res.render('error', {title:'Work not found', text:'Work not found'});
        }
    });
});

app.post('/works/:id/edit', function(req, res){
    const id = req.params.id;
    const name = req.body.name;
    const sqlFind = 'SELECT * FROM works WHERE id=?';
    let projectId;
    db.query(sqlFind, [id], function(error, works){
        if(error) throw error;
        const work = works[0];
        projectId = work.project_id;
    });
    const sqlEditWork = 'UPDATE works SET name=? WHERE id=?';
    if(name != undefined && name != null){
        db.query(sqlEditWork, [name, id], function(error, result){
            if(error) throw error;
            req.session.editWork = `Work ${name} edit success!`;
            res.redirect(`/projects/${projectId}/works`);
        });
    }
    else{
        res.render('error', {title:'Work is null', text:'Work is null'});
    }
});

app.use(function(req, res){
    res.render('error', {title:'Not found', text:'Not found'});
});

app.listen(PORT, function(){
    console.log('Server is rinning on port: ' + PORT);
});