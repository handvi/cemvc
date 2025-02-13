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

const folders = ["public", "public/css", "public/js", "public/images", "routes", "views", "models", "config", "controllers"];
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

nunjucks.configure('views', {
  autoescape: true,
  express: app
});

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
};
`,
  "views/index.njk": `<html>
<head>
  <title>{{ title }}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div class="welcome-card">
    <h1>🚀 Welcome to CEMVC</h1>
    <p>Your Express MVC framework generator, making development easier and more structured.</p>
    <a href="#" class="doc-button">Read the Documentation</a>
  </div>
</body>
</html>`,
  "public/css/style.css": `body {
  font-family: Arial, sans-serif;
  text-align: center;
  background: #f4f4f4;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.welcome-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

.doc-button {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  text-decoration: none;
  color: white;
  background: #007BFF;
  border-radius: 5px;
  transition: background 0.3s ease;
}

.doc-button:hover {
  background: #0056b3;
}`,
  "public/js/script.js": `console.log("Welcome to Express MVC");`
};

function createProject(projectName, dbChoice) {
  const projectPath = path.join(process.cwd(), projectName);
  if (fs.existsSync(projectPath)) {
    console.error(chalk.red.bold("❌ Project folder already exists!"));
    process.exit(1);
  }

  fs.mkdirSync(projectPath);
  process.chdir(projectPath);

  folders.forEach((folder) => fs.mkdirSync(folder, { recursive: true }));

  Object.entries(files).forEach(([file, content]) => {
    fs.writeFileSync(file, content);
  });

  const dbConfig = dbChoice === "mysql" ? `import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

export default sequelize;` : `import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

export default mongoose;`;

fs.writeFileSync("config/db.js", dbConfig);

  console.log(chalk.yellowBright("\n📦 Generating package.json..."));

  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "Express MVC project",
    main: "app.js",
    type: "module",
    scripts: {
      start: "node app.js",
      dev: "nodemon app.js"
    },
    dependencies: {
      express: "^4.18.2",
      nunjucks: "^3.2.4",
      dotenv: "^16.3.1",
      chalk: "^5.3.0",
      figlet: "^1.5.2"
    },
    devDependencies: {
      nodemon: "^3.0.0"
    }
  };

  if (dbChoice === "mysql") {
    packageJson.dependencies.sequelize = "^6.32.1";
    packageJson.dependencies.mysql2 = "^3.9.1";
  } else if (dbChoice === "mongo") {
    packageJson.dependencies.mongoose = "^7.6.3";
  }

  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

  console.log(chalk.green("\n📦 Installing dependencies...\n"));

  try {
    execSync("npm install", { stdio: "inherit" });
    console.log(chalk.greenBright("\n✅ Express MVC Project Created Successfully!\n"));
    console.log(chalk.blueBright("👉 To start your project:"));
    console.log(chalk.yellow(`   cd ${projectName}`));
    console.log(chalk.yellow("   npm run dev"));
    console.log("\n🎉 Happy coding!\n");
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