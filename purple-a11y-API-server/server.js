//Imports
const { fork } = require('child_process');
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
app.post("/options",(req,res) =>{
  // Extract the keys and values from the request body
  const { c, k, u } = req.body;

  // Set the options object properties based on the request body
  options.c = c;
  options.k = k;
  options.u = u;

  // Log the updated options object
  console.log(options);

  // You can access specific properties of the options object like this:
  console.log("Crawler:", options.c);
  console.log("K:", options.k);
  console.log("URL:", options.u);
})

app.post("/",(req,res) =>{
  // Change the current working directory if necessary
  process.chdir(rootDir);

  let commandArgs = ['cli.js'];

  for (const [key, value] of Object.entries(req.body)) {
      commandArgs.push(`-${key}`, `${value}`);
  }

  const childProcess = fork('cli.js', commandArgs, {
    stdio: 'inherit' ,// Redirect child's stdio to the parent process
    env: {
      ...process.env, // Copy current environment variables
      PURPLE_A11Y_VERBOSE: 'true' // Set PURPLE_A11Y_VERBOSE specifically for the child process
  }
});
childProcess.on('message', (message) => {
  const parsedMessage = JSON.parse(message);
  if(parsedMessage.type === "storagePath")
  {
    console.log('Message from child process:', parsedMessage.payload);
  }
  else{
    console.log("NOPE BUT MSG SENT");
  }

  // Handle messages received from the child process
});

childProcess.on('error', (error) => {
  console.error(`Error executing script: ${error}`);
  // Handle error
});

childProcess.on('close', (code) => {
  if (code !== 0) {
      console.error(`Script exited with code ${code}`);
      // Handle non-zero exit code
  } else {
      console.log(`Script finished successfully.`);
      res.sendStatus(200);
      // Handle successful execution
  }
});
});


// Servers
const server = app.listen(8080, () => {
    console.log('purple-hats-backend listening on port 8080!');
});
const server1 = app.listen(8081, () => {
  console.log('purple-hats-backend listening on port 8080!');
});