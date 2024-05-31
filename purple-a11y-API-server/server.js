//Imports
import {scanInit} from "../cli.js"


const express = require(`express`);

const app = express();

// GET requests
app.get("/",(req,res) =>{
  res.send('Hello Node API')
})



// Servers
const server = app.listen(8080, () => {
    console.log('purple-hats-backend listening on port 8080!');
});
const server1 = app.listen(8081, () => {
  console.log('purple-hats-backend listening on port 8080!');
});