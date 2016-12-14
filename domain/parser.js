const jsdom = require('jsdom');
const gs    = require('./lib/gs');

function Rule(selector,callback){
    this.invoke = function(window,buffer){
        selector = Array.isArray(selector)?selector:[selector];
        for(let itm of selector){
            let elements = window.document.querySelectorAll(itm);
            if(elements){
                for(let element of elements)
                    callback.call(buffer,element);
            }
        }
    }
}
function createReader(rules){
    return function reader(window){
        return new Promise(function(resolve,reject){
            let buffer = {heap:[],facts:[],into:null,href:window.location.href};
            try{
                for(let rule of rules.values())
                    rule.invoke(window, buffer);
                resolve(buffer);
            }
            catch(err){
                reject(err);
            }
        });
    }
}

module.exports = function(repository){
    let  heap 	    = []
        ,fullHeap   = []
        ,initRules 	= new Map()
        ,rules 		= new Map()
        ,domain     = null;

    function analize(url,reader){
        return new Promise(
            function(resolve,reject){
                jsdom.env({
                    url: url,
                    done: function (err, window) {
                        if(err)
                            reject(err);

                        reader(window).then(
                            function(buffer){
                                writeToHeap(buffer);
                                if(buffer.into){
                                    repository.collection(buffer.into).insertMany(buffer.facts)
                                        .then(()=>{resolve();},(err)=>{reject(err);});                                   
                                }
                                else
                                    resolve();
                            },
                            function(err){
                                reject(err);
                            }
                        );
                    }
                });
            });
    }
    function writeToHeap(buffer){
        for(let url of buffer.heap){
            if(!fullHeap.includes(url)){
                heap.push(url);
                fullHeap.push(url);
            }
        }
    }

    this.init = function(name,selector,callback){
        initRules.set(name,new Rule(selector,callback));
        return this;
    };
    this.rule = function(name,selector,callback){
        rules.set(name,new Rule(selector,callback));
        return this;
    };
    this.run = function(url){
        domain = url;
        fullHeap = [];
        let  initReader      = createReader(initRules)
            ,baseCycleReader = createReader(rules);

        return new Promise(function(resolve,reject){
            analize(url,initReader).then(
                function(){
                    gs(function*(){
                        while(heap.length){
                            let cur = heap.shift();
                            yield analize(cur,baseCycleReader);
                        }
                        console.log("end");
                        resolve();
                    });
                },
                function(err){
                    reject(err);
                }
            );

        });
    }
};