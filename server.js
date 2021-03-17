'use strict';

// including - importing libraries
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const methodOverride = require('method-override');

// setup and configuration
require('dotenv').config();
const app = express();
app.use(cors());
app.use(methodOverride('_method'));
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
const client = new pg.Client(process.env.DATABASE_URL);   // on your machine
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); // for heroku
const PORT = process.env.PORT;

app.get('/', handleHome);
app.post("/getCountryResult", handleCountryResult);
app.get("/countries", handleCountries);
app.post('/my-record', handleRecordToDB);
app.get("/my-record", handleRecord);
app.get("/my-record/:id", handleRecordDetail);
app.delete("/my-record/:id", handleDeleteRecord);




function handleHome(req, res){
    let url = 'https://api.covid19api.com/world/total';
    superagent.get(url).then(data=>{
        console.log(data.body);
        res.render('index', {data: data.body})
    })

}

function handleCountryResult(req, res){
    let country = req.body.country;
    let firstDate = req.body.first;
    let lastDate = req.body.last;
    console.log(country, firstDate, lastDate);
   let  query = {
      from: firstDate,
      to: lastDate,
    };
    let url = `https://api.covid19api.com/country/${country}/status/confirmed`;
    superagent.get(url).query(query).then(data=>{
        // console.log(data.body);
        res.render('countries', {data: data.body})
    })
}

function handleCountries(req, res){
    let url = "https://api.covid19api.com/summary";

    let arr = [];
    superagent.get(url).then(data=>{
      
         data.body.Countries.forEach((element) => {
           let country = element.Country + ", " + element.CountryCode;
           let confirmed = element.TotalConfirmed;
           let deaths = element.TotalDeaths;
           let recovered = element.TotalRecovered;
           let date = element.Date;
           let obj = new Countries(country, confirmed, deaths, recovered, date);
           arr.push(obj);
         });
         res.render('allcountries', {data: arr});
    })


}

function handleRecordToDB(req, res){
    let country = req.body.country;
    let confirmed = req.body.confirmed;
    let death = req.body.death;
    let recovered = req.body.recovered;
    let date = req.body.date;

    let sql = `insert into record(country, confirmed, deaths, recovered, date) values($1,$2,$3,$4,$5)`;
    let value = [country, confirmed,death, recovered, date];
    client.query(sql,value).then(data=>{
        res.redirect("/my-record");
    }).catch(error=>{
        console.log(error);
    })
        
}

function handleRecord(req, res){
    let sql = `select * from record`;
    client.query(sql).then(data=>{
        res.render('my-records', {data: data.rows, total: data.rowCount})
    })
}

function handleRecordDetail(req,res){
    let id = req.params.id;
    let sql = `select * from record where id = ${id}`;
    client.query(sql).then(data=>{
        res.render("detail", { element: data.rows[0] });
    })
}

function handleDeleteRecord(req, res){
    let id = req.params.id;
    let sql = `delete from record where id  = ${id}`;
    client.query(sql).then(data=>{
        res.redirect('/my-record');
    }).catch(error=>{
        console.log(error);
    })
}




function Countries(country, confirmed,deaths,recovered, date){
    this.country = country;
    this.confirmed = confirmed;
    this.deaths = deaths;
    this.recovered = recovered;
    this.date =date;
}





client.connect().then(data=>{
    app.listen(PORT, ()=>{
        console.log('app listening to '+ PORT);
    })
}).catch(error=>{
    console.log("can't connect to database "+ error)})