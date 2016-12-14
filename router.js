const repository = require('./data/repository').handler();
const tableify   = require('html-tableify');


module.exports = function(app){
    app.get("/get_categories",function(req,res,next){
        repository.collection("categories").find().toArray().then(function(doc){
            res.send(tableify(doc));
        })
    });
    app.get("/get_goods",function(req,res,next){
        repository.collection("goods").find({category:req.query.category}).toArray().then(function(doc){
            res.send(tableify(doc));
        })
    })
};