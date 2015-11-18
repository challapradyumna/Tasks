    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var fs = require('fs');
    var multer  = require('multer')
    var upload = multer({ dest: 'uploads/' })
    var Schema = mongoose.Schema;
    var db = mongoose.connection;

    var bodyParser = require('body-parser')
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
    })); 
   

    var Task;

    db.on('error', console.error);
    db.once('open', function() {
      // Create your schemas and models here.
    var taskSchema = new Schema({

        description: String ,
        details: String,
        type: String ,
        uploadDocPath : String,
        remainderTime: String,
        finalized: String,
    
    });
    Task  = mongoose.model('Task',taskSchema);
    console.log('Models Created');
    });

    // configuration =================

     mongoose.connect('mongodb://etazero.com:27017/test');     // connect to mongoDB database on modulus.io

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
    

    //routes ========================================

    app.get('/api/tasks',function(req,res){

        console.log("Task Saved");
        Task.find({}, function(err, tasks) {
          if (err) {
            console.log(err);
          }
          // object of all the tasks
          res.json(tasks);
        });
    });

    app.post('/api/task/:task_id',function(req,res){
        Task.findOne({ _id: req.params.task_id }, function (err, doc){
            if(err)
            {
                console.log(err);
                res.send(err);
            }
            console.log(doc);
            if(req.param('details', null) != null)
            {
                doc.details = req.param('details',null);
                doc.save();
                res.send("Success");
            }
        });
    });
    app.post('/api/fileUpload/:task_id', upload.single('document'), function (req, res, next) {
        console.log(req.file);
        var extn = req.file.originalname.split('.').pop();
        var fileName = req.file.filename+"."+extn;
        fs.rename(req.file.destination+req.file.filename,req.file.destination+fileName);
        Task.findOne({ _id: req.params.task_id }, function (err, doc){
            if(err)
            {
                console.log(err);
                res.send(err);
            }
            console.log(doc);
            
                doc.uploadDocPath = req.file.destination+fileName ;
                doc.save();
                res.send(doc.uploadDocPath);
            
        });
      // req.file is the `document` file
      // req.body will hold the text fields, if there were any

    });

    app.post('/api/tasks',function(req,res){
        //Hardcoding for creation of tasks
        console.log("Task Creation Started");
        console.log(req.param('this', null));
        var task = new Task({
            description: "Task 2",
            type: "Task" ,
            uploadDocPath : "/uploads/this/that.png",
            remainderTime: "2015:24:06",
            finalized: "No",
        },function(err,todo){
            if(err)
            {
                res.send(err);
                console.log(err);
            }
        });
        console.log("Task Object Created");
        
        Task.find(function(err,todos){
            if(err)
                res.send(err);
            res.json(todos);
        });
    });
    app.get('/:file(*)', function(req, res, next){
        var file = req.params.file
    , path = __dirname + '/' + file;

    res.download(path);
});
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });



    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");