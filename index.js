#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from "readline";
import chalk from "chalk";
import figlet from "figlet";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folders = [
  "public", "public/css", "public/js", "public/images",
  "routes", "views", "models", "config", "controllers", "utils", "middlewares"
];


const files = {
  "app.js": `import express from 'express';
import nunjucks from 'nunjucks';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'nunjucks');
nunjucks.configure('views', { autoescape: true, express: app });

import indexRoutes from './routes/index.js';
app.use('/', indexRoutes);

app.listen(port, () => {
  console.log(chalk.greenBright(\`🚀 Server running on http://localhost:\${port}\`));
});
`,

  "routes/index.js": `import express from 'express';
import HomeController from '../controllers/HomeController.js';

const router = express.Router();
router.get('/', HomeController.index);

export default router;
`,

  "controllers/HomeController.js": `const HomeController = {
  index: (req, res) => {
    res.render('index.njk', { title: 'Welcome to Express MVC' });
  }
};

export default HomeController;
`,

  "models/User.js": `export default class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}
`,

  "config/db.js": `import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import mysql from 'mysql2';

const useMongo = process.env.DB_URI !== undefined;

if (useMongo) {
  mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));
} else {
  const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  db.connect(err => {
    if (err) {
      console.error('❌ MySQL Connection Error:', err);
    } else {
      console.log('✅ Connected to MySQL');
    }
  });
}
`,

  "views/index.njk": `<html>
<head>
  <title>{{ title }}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>{{ title }}</h1>
      <p>🚀 Welcome to your Express MVC project!</p>
      <button class="btn">Read Documentation</button>
    </div>
  </div>
</body>
</html>
`,

  "public/css/style.css": `body {
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4;
}

.container {
  text-align: center;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn {
  background: #007BFF;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;
}

.btn:hover {
  background: #0056b3;
}`
};


function createEnvFile(projectPath, dbChoice) {
  const envPath = path.join(projectPath, ".env");
  const envContent = dbChoice === "mysql"
    ? "PORT=3000\nDB_HOST=localhost\nDB_USER=root\nDB_PASS=\nDB_NAME=cemvc"
    : "PORT=3000\nDB_URI=mongodb://localhost:27017/cemvc";

  try {
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log(chalk.green(`✅ .env file created at ${envPath}`));
  } catch (error) {
    console.error(chalk.red(`❌ Error creating .env file at ${envPath}:`, error.message));
  }
}


function createProject(projectName, dbChoice) {
  const projectPath = path.join(process.cwd(), projectName);
  if (fs.existsSync(projectPath)) {
    console.error(chalk.red.bold("❌ Project folder already exists!"));
    process.exit(1);
  }

  console.log(chalk.blue(`📁 Creating project: ${projectName}`));

  fs.mkdirSync(projectPath, { recursive: true });

 
  folders.forEach((folder) => {
    try {
      fs.mkdirSync(path.join(projectPath, folder), { recursive: true });
    } catch (error) {
      console.error(chalk.red(`❌ Error creating folder ${folder}:`, error.message));
    }
  });

  Object.entries(files).forEach(([file, content]) => {
    try {
      fs.writeFileSync(path.join(projectPath, file), content, "utf8");
    } catch (error) {
      console.error(chalk.red(`❌ Error creating file ${file}:`, error.message));
    }
  });

  createEnvFile(projectPath, dbChoice);

 
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "A simple Express MVC application",
    type: "module",
    main: "app.js",
    scripts: {
      dev: "node app.js",
      start: "node app.js"
    },
  dependencies: {
    express: "^4.18.2",
    nunjucks: "^3.2.4",
    dotenv: "^16.3.1",
    chalk: "^5.3.0",
    figlet: "^1.5.2",
    mongoose: "^7.6.3"
  },
  devDependencies: {
    nodemon: "^3.0.0"
  }
  };

  try {
    fs.writeFileSync(path.join(projectPath, "package.json"), JSON.stringify(packageJson, null, 2), "utf8");
    console.log(chalk.green("✅ package.json created successfully!"));
  } catch (error) {
    console.error(chalk.red(`❌ Error creating package.json:`, error.message));
  }

  console.log(chalk.green("\n📦 Installing dependencies...\n"));

  try {
    execSync("npm install express nunjucks dotenv chalk", { cwd: projectPath, stdio: "inherit" });
    console.log(chalk.greenBright("\n✅ Express MVC Project Created Successfully!\n"));
  } catch (error) {
    console.error(chalk.red("❌ Failed to install dependencies. Please install manually with 'npm install'"));
  }
}


function askDatabaseChoice(callback) {
  console.clear();
  console.log(chalk.blueBright(figlet.textSync("CEMVC", { horizontalLayout: "full" })));
  console.log(chalk.greenBright("🚀 Welcome to CEMVC - Express MVC Generator\n"));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(chalk.yellow("🔍 Choose database (mysql/mongo): "), (dbChoice) => {
    dbChoice = dbChoice.toLowerCase();
    if (dbChoice !== "mysql" && dbChoice !== "mongo") {
      console.log(chalk.red("⚠️ Invalid choice! Defaulting to MySQL..."));
      dbChoice = "mysql";
    }
    rl.close();
    callback(dbChoice);
  });
}


const projectName = process.argv[2] || "my-express-app";
askDatabaseChoice((dbChoice) => {
  createProject(projectName, dbChoice);
});
