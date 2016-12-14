const MongoClient = require('mongodb').MongoClient;
var Handler = null;
module.exports.connect = function(stringConnect="mongodb://localhost:27017/parser"){
    return new Promise((resolve,reject)=>{
        MongoClient.connect(stringConnect).then(
            (db)=>{
                Handler = db;
                resolve(db);
            },
            (err)=>{
                reject(err);
            })
    });
};
module.exports.handler = ()=>{return Handler};