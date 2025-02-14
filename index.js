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
  "routes", "views", "models", "config", "controllers"
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
`
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
