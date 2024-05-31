//Imports
const { exec } = require('child_process');

const express = require(`express`);
const path = require('path');
const rootDir = path.resolve(__dirname, '..'); // Assuming the root directory is one level up


const app = express();

app.use(express.json());

// GET requests
app.get("/",(req,res) =>{
  res.send('Hello Node API')
})

// Post request
app.post("/",(req,res) =>{
  process.chdir(rootDir);

  let commandString = 'node cli.js';

  for (const [key, value] of Object.entries(req.body)) {
      commandString += ` -${key} "${value}"`;
  }

  console.log(commandString);
  exec(commandString, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing script: ${error}`);
        return res.status(500).send(`Error executing script: ${error.message}`);
    }

    if (stderr) {
        console.error(`Script stderr: ${stderr}`);
        return res.status(500).send(`Script stderr: ${stderr}`);
    }

    console.log(`Script output: ${stdout}`);
    res.send(`Script output: ${stdout}`);
});
})



// Servers
const server = app.listen(8080, () => {
    console.log('purple-hats-backend listening on port 8080!');
});
const server1 = app.listen(8081, () => {
  console.log('purple-hats-backend listening on port 8080!');
});