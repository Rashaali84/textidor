'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// - setup -
const FILES_DIR = __dirname + '/text-files';
// create the express app
const app = express();
// - use middleware -
// allow Cross Origin Resource Sharing
app.use(cors());
/*app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Authorization, x-id, Content-Length, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});*/
// parse the body
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'text/plain' }));

// https://github.com/expressjs/morgan#write-logs-to-a-file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));
// and log to the console
app.use(morgan('dev'));

// statically serve the frontend
//use the following code to serve images,
//CSS files, and JavaScript files in a directory named public:
app.use(express.static('public'));
app.use(express.static('public/app'));
//taskkill /im node.exe --- > to kill any node.exe process 

//Algorithm detected from demo 

// -- save a file fores twi requests - 
//http://localhost:8080/files/text.txt
//Request Method: POST
//http://localhost:8080/files
//Request Method: GET

//--- clicking on file name 
//http://localhost: 8080 / files / text.txt
//Request Method: GET


// - declare routes -

// read all file names
app.get('/files/', (req, res, next) => {
  fs.readdir(FILES_DIR, (err, list) => {
    if (!list) {
      res.status(404).end();
      return;
    }
    if (err) {
      // https://expressjs.com/en/guide/error-handling.html
      next(err);
      return;
    }

    res.json(list);
  });
});

// read a file
app.get('/files/:name', (req, res, next) => {
  const fileName = req.params.name;

  fs.readFile(`${FILES_DIR}/${fileName}`, 'utf8', (err, fileText) => {
    if (!fileText) {
      res.status(404).end();;
      return;
    }
    if (err) {
      next(err);
      return;
    }

    const responseData = {
      name: fileName,
      text: fileText,
    };
    res.json(responseData);
  });
});

// write a file
app.post('/files/:name', (req, res, next) => {
  const fileName = req.params.name;
  const fileText = req.body.text;
  fs.writeFile(`${FILES_DIR}/${fileName}`, fileText, err => {
    if (err) {
      next(err);
      return;
    }
    // https://stackoverflow.com/questions/33214717/why-post-redirects-to-get-and-put-redirects-to-put
    res.redirect(303, 'http://localhost:8080/files/');
  });
});

// delete a file
//Request URL: http://localhost:8080/files/text.txt
//Request Method: DELETE
app.delete('/files/:name', (req, res, next) => {
  const fileName = req.params.name;
  console.log(fileName);
  fs.unlink(`${FILES_DIR}/${fileName}`, err => {
    if (err && err.code === 'ENOENT') {
      // file doesn't exist
      console.log(err);
      next(err);
      return;
    }
    if (err) {
      // other errors, e.g. maybe we don't have enough permission
      console.log(err);
      next(err);
      return;

    }
    res.redirect(303, 'http://localhost:8080/files/');
  });
});

// - handle errors in the routes and middleware -

// https://expressjs.com/en/guide/error-handling.html
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).end();
});

// - open server -
// try to exactly match the message logged by demo.min.js

app.listen(config.PORT, () => {
  console.log(
    `App is listening at http://localhost:${config.PORT} (${config.MODE} mode)`
  );
});;
