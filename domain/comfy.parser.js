const Parser     = require("./parser");
const url        = require('url');
const connect    = require('../data/repository').connect;


connect().then(
    function(repository){
        var comfy = new Parser(repository);
        comfy
            .init(
                "root"
                ,`header nav .nav__item.js-nav-item.js-nav-item-first > .nav__item-content.js-nav-name._has-child`
                ,function(element){
                    this.heap.push(element.href);
                    this.facts.push({
                        url:url.parse(element.href).pathname,
                        name:element.querySelector(".nav__name").innerHTML.trim(),
                        parent:""
                    });
                    this.into = "categories";
                }
            )
            .rule(
                "category"
                ,[
                     `.category .cms-category__cat-item.cms-category__cat-item_main a`
                    ,`.category .cms-category__cat-item a`
                ]
                ,function(element){
                    this.heap.push(element.href);

                    this.facts.push({
                        url:url.parse(element.href).pathname,
                        name:element.text.trim(),
                        parent:url.parse(this.href).pathname
                    });
                    this.into = "categories";
                }
            )
            .rule(
                "goods"
                ,`.category__list .products-tiles .content`
                ,function(element){

                    if(!element.querySelector(".products-tiles__cell__name"))
                        return;

                    let  name  = element.querySelector(".products-tiles__cell__name a")
                        ,price = element.querySelector(".price-box__content .price-value")
                        ,description = "";

                    name  = name?name.innerHTML.trim():"";
                    price = price?price.innerHTML.trim():"0";

                    for(let elt of element.querySelectorAll(".options dl")){
                        description+=`${elt.querySelector(".name").innerHTML.trim()} ${elt.querySelector(".value.attribute-link").innerHTML.trim()}\n`
                    }                    

                    this.facts.push({
                        name,
                        description,
                        price:parseFloat(price),
                        category:url.parse(this.href).pathname
                    });
                    this.into = "goods"
                }
            )
            .rule(
                "pages"
                ,`.pager__i .pager__number a`
                ,function(element){
                    this.heap.push(element.href);
                }
            )
            .run("http://comfy.ua");
});
