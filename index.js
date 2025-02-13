#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

// Prompt user untuk memilih database
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\nChoose your database:");
console.log("1. MySQL (Sequelize)");
console.log("2. MongoDB (Mongoose)");

rl.question("\nEnter your choice (1/2): ", (choice) => {
  let selectedDB;
  let dependencies = ["express", "dotenv"];
  let dbFileContent = "";

  if (choice === "1") {
    selectedDB = "MySQL (Sequelize)";
    dependencies.push("sequelize", "mysql2");

    dbFileContent = `const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

sequelize.authenticate()
  .then(() => console.log('✅ Connected to MySQL successfully'))
  .catch(err => console.error('❌ Unable to connect to MySQL:', err));

module.exports = sequelize;`;
  } else if (choice === "2") {
    selectedDB = "MongoDB (Mongoose)";
    dependencies.push("mongoose");

    dbFileContent = `const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

module.exports = mongoose;`;
  } else {
    console.log("❌ Invalid choice. Exiting...");
    rl.close();
    process.exit(1);
  }

  rl.close();

  console.log(`\n📦 Setting up Express MVC with ${selectedDB}...\n`);

  const folders = ["public", "routes", "views", "models", "controllers"];
  const files = {
    "app.js": `const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = require('./models/db');
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

app.listen(port, () => {
  console.log(\`🚀 Server running on http://localhost:\${port}\`);
});
`,
    "routes/index.js": `const express = require('express');
const router = express.Router();
const HomeController = require('../controllers/HomeController');

router.get('/', HomeController.index);

module.exports = router;
`,
    "controllers/HomeController.js": `const path = require('path');

exports.index = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
};
`,
    "models/db.js": dbFileContent,
    ".env": choice === "1" ? `DB_HOST=localhost
DB_NAME=mydatabase
DB_USER=root
DB_PASS=password
PORT=3000` : `MONGO_URI=mongodb://localhost:27017/mydatabase
PORT=3000`,
    "public/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Express MVC</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Express MVC</h1>
        <p>This is a simple MVC structure for Express.js</p>
        <a href="/docs">Read the Documentation</a>
    </div>
</body>
</html>`,
    "public/css/style.css": `body {
    font-family: Arial, sans-serif;
    text-align: center;
    background-color: #f4f4f4;
    padding: 50px;
}

.container {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    display: inline-block;
}`
  };

  function createProject(projectName) {
    const projectPath = path.join(process.cwd(), projectName);
    if (fs.existsSync(projectPath)) {
      console.error("❌ Project folder already exists!");
      process.exit(1);
    }

    fs.mkdirSync(projectPath);
    process.chdir(projectPath);

    folders.forEach((folder) => fs.mkdirSync(folder));
    Object.entries(files).forEach(([file, content]) => {
      const filePath = path.join(projectPath, file);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    });

    // Generate package.json
    const packageJson = {
      name: projectName,
      version: "1.0.0",
      description: "Express MVC Project",
      main: "app.js",
      scripts: {
        start: "node app.js",
        dev: "nodemon app.js"
      },
      dependencies: {},
      devDependencies: {
        nodemon: "^3.0.0"
      }
    };

    dependencies.forEach(dep => {
      packageJson.dependencies[dep] = "latest";
    });

    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

    console.log("\n📦 Installing dependencies...");

    // Install dependencies
    execSync("npm install", { stdio: "inherit" });

    console.log("\n✅ Setup complete!");
    console.log("\n🚀 Run 'npm run dev' to start the development server with nodemon.");
  }

  const projectName = process.argv[2] || "my-express-app";
  createProject(projectName);
});
