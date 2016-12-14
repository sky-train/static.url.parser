const express   = require('express');
const path      = require('path');
const app       = new express();
const connect   = require('./data/repository').connect;

connect()
    .then(function(){
        const pouter    = require('./router');

        app.use(express.static(path.join(__dirname,'view')));
        pouter(app);
        app.listen(8080);
    });
