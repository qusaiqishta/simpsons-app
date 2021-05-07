'use strict'
//application dependences 

const express=require('express');
const pg=require('pg');
const superagent=require('superagent');
const cors=require('cors');
const methodOverride=require('method-override');
const { render } = require('ejs');

// Environmental variables
require('dotenv').config();
const PORT=process.env.PORT;
const DATABASE_URL=process.env.DATABASE_URL;

//application setup
const app=express();

//Express mildware
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

//specify a directory for static resources 
app.use(express.static('public'));

//set the view engine for server-side templating 
app.set('view engine','ejs');

//use app cors
app.use(cors());

//Database setup
const client=new pg.Client(DATABASE_URL);


app.get('/',renderHomePage);
app.get('/favorite-quotes',allFavoriteSimpsons);
app.get('/favorite-quotes/:quote_id',viewDetails);
app.post('/save-qoute',saveQuote);
app.put('/favorite-quotes/:quote_id',updateQuote);
app.delete('/favorite-quotes/:quote_id',deleteQuote);





function Simpson(simpInfo){
    this.quote=simpInfo.quote;
    this.character=simpInfo.character;
    this.image=simpInfo.image;
    this.characterDirection=simpInfo.characterDirection;
}





function renderHomePage(req,res){
    const url='https://thesimpsonsquoteapi.glitch.me/quotes?count=10';
    superagent.get(url).set('User-Agent', '1.0').then(results=>{
        const simpsons=results.body.map(object=>{
            return new Simpson(object);
        })
        res.render('index',{simpsons:simpsons});
    })
}

function allFavoriteSimpsons(req,res){
    const sql='SELECT * FROM simp;';
    client.query(sql).then(results=>{
        res.render('favorite_qoutes.ejs',{simpsons:results.rows});
    })
}

function saveQuote(req,res){
    const{quote,character,image,characterDirection}=req.body;
    const sql='INSERT INTO simp(quote,character,image,characterDirection) VALUES($1,$2,$3,$4);';
    const safeValues=[quote,character,image,characterDirection];
    client.query(sql,safeValues).then(()=>{
        res.redirect('/favorite-quotes')
    })
}


function viewDetails(req,res){
    const quoteId=req.params.quote_id;
    const sql=' select * from simp WHERE id=$1;';
    const safeValue=[quoteId];
    client.query(sql,safeValue).then(results=>{
        res.render('qoute_details.ejs',{quotes:results.rows});
    })
}

function updateQuote(req,res){
    const quoteId=req.params.quote_id;
    const sql='UPDATE simp SET quote=$1 WHERE id=$2;';
    const quote=req.body;
    const safeValue=[quote,quoteId];
    client.query(sql,safeValue).then(()=>{
        res.redirect('/favorite-quotes')
    })
}

function deleteQuote(req,res){
    const quoteId=req.params.quote_id;
    const sql='DELETE FROM simp WHERE id=$1;';
    const safeValue=[quoteId];
    client.query(sql,safeValue).then(()=>{
        res.redirect('/favorite-quotes');
    })
}


client.connect().then(()=>{
    app.listen(PORT,console.log('listening to PORT',PORT))
}).catch((error)=>console.log(error))