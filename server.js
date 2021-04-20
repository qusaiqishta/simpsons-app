'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 5000;
const DATABASE_URL=process.env.DATABASE_URL;


// Express middleware
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
// Utilize ExpressJS functionality to parse the body of the request

// Specify a directory for static resources
app.use(express.static('/public'));

// define our method-override reference

// Set the view engine for server-side templating
app.set('view engine','ejs');

// Use app cors
app.use(cors());

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

app.get('/',renderHomePage);
app.get('/favorite-quotes',allfavoriteSimpsons);
app.get('/favorite-quotes/:quote_id',viewSimpsonDetails);
app.post('/save-qoute',saveQoute);
app.put('/update-qoute',updateQoute);
app.delete('/delete-qoute',deleteQoute);



function Simpson(simpInfo){
    this.quote=simpInfo.quote;
    this.character_name=simpInfo.character_name;
    this.image_url=simpInfo.image_url;
    this.description=simpInfo.description;
}



function renderHomePage(req,res){
    const url='https://thesimpsonsquoteapi.glitch.me/quotes?count=10';
    superagent.get(url).set('User-Agent', '1.0').then(results=>{
        const simpsons=req.body.map(object=>new Simpson(object));
    });res.render('index',{simpsons:simpsons});
}

function allfavoriteSimpsons(req,res){
    const sql='SELECT * FROM simp WHERE id=$1;';
    const safevalue=['api'];
    client.query(sql,safevalue).then(results=>{
        res.render('favorite_qoutes.ejs',{simpsons:results.rows});
    })
}

function viewSimpsonDetails(req,res){
    quoteId=req.params.quote_id;
    const sql='SELECT * FROM simp WHERE id=$1;';
    const safevalue=[quoteId];
    client.query(sql,safevalue).then(results=>{
        res.render('qoute_details.ejs',{quotes:results.rows});
    })
}


function saveQoute(req,res){
    const{qoute,character_name,image_url,description}=req.body;
    const sql='INSERT INTO simp(qoute,character_name,image_url,description) VALUES($1,$2,$3,$4);';
    const safevalue=[qoute,character_name,image_url,description,'api'];
    client.query(sql,safevalue).then(()=>{
        res.redirect('/favorite-quotes')
    })
}

function updateQoute(req,res){
const quoteId=req.params.quote_id;
const sql='UPDATE simp SET qoute=$1,character_name=$2,image_url=$3,description=$4;';
const{qoute,character_name,image_url,description}=req.body;
const safevalue=[qoute,character_name,image_url,description];
client.query(sql,safevalue).then(()=>{
    res.redirect(`/quout/${quoteId}`);
})}

function deleteQoute(req,res){
    const quoteId=req.params.quote_id;
    const sql='DELETE FROM simp WHERE id=$1;';
    const safevalue=[quoteId];
    client.query(sql,safevalue).then(()=>{
        res.render('/favorite-quotes/:quote_id');
    })
}




// helper functions

// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
).catch((error)=>console.log(error));
