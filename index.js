#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from "readline";
import chalk from "chalk";
import figlet from "figlet";
import { fileURLToPath } from "url";

// Get __filename and __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define project structure
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Nunjucks setup
app.set('view engine', 'nunjucks');
nunjucks.configure('views', { autoescape: true, express: app });

// Routes
import indexRoutes from './routes/index.js';
app.use('/', indexRoutes);

// Start server
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

  "models/User.js": `// This is an example model. You can define your Mongoose/Sequelize models here.
export default class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}
`,

  "config/db.js": `import dotenv from 'dotenv';
import mongoose from 'mongoose';
import mysql from 'mysql2/promise'; // Using promise-based mysql2

dotenv.config();

const connectDB = async () => {
  const useMongo = process.env.DB_URI !== undefined;

  if (useMongo) {
    try {
      await mongoose.connect(process.env.DB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (err) {
      console.error('❌ MongoDB Connection Error:', err.message);
      process.exit(1); // Exit process on connection failure
    }
  } else {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
      });
      console.log('✅ Connected to MySQL');
      return connection; // Return connection for MySQL
    } catch (err) {
      console.error('❌ MySQL Connection Error:', err.message);
      process.exit(1); // Exit process on connection failure
    }
  }
};

export default connectDB;
`,

  "views/index.njk": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>{{ title }}</h1>
      <p>🚀 Welcome to your Express MVC project!</p>
      <button class="btn" onclick="window.open('https://expressjs.com/en/starter/installing.html', '_blank')">Read Express Docs</button>
      <button class="btn secondary" onclick="window.open('https://www.nunjucks.com/templating.html', '_blank')">Read Nunjucks Docs</button>
    </div>
  </div>
</body>
</html>
`,

  "public/css/style.css": `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #e0f2f7; /* Light blue background */
  margin: 0;
  color: #333;
}

.container {
  text-align: center;
  padding: 20px;
}

.card {
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
}

h1 {
  color: #007bff;
  margin-bottom: 15px;
  font-size: 2.5em;
}

p {
  font-size: 1.1em;
  line-height: 1.6;
  margin-bottom: 25px;
}

.btn {
  background: #007BFF;
  color: white;
  border: none;
  padding: 12px 25px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 1em;
  margin: 5px;
  transition: background 0.3s ease, transform 0.2s ease;
}

.btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

.btn.secondary {
  background: #6c757d;
}

.btn.secondary:hover {
  background: #5a6268;
}
`
};

/**
 * Creates the .env file with database-specific content.
 * @param {string} projectPath - The path to the new project directory.
 * @param {string} dbChoice - The user's database choice ('mysql' or 'mongo').
 */
function createEnvFile(projectPath, dbChoice) {
  const envPath = path.join(projectPath, ".env");
  const envContent = dbChoice === "mysql"
    ? `PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=${path.basename(projectPath)}`
    : `PORT=3000
DB_URI=mongodb://localhost:27017/${path.basename(projectPath)}`; // Dynamic DB name

  try {
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log(chalk.green(`✅ .env file created at ${envPath}`));
  } catch (error) {
    console.error(chalk.red(`❌ Error creating .env file at ${envPath}:`, error.message));
    process.exit(1);
  }
}

/**
 * Creates the new Express MVC project.
 * @param {string} projectName - The name of the project.
 * @param {string} dbChoice - The user's database choice.
 */
function createProject(projectName, dbChoice) {
  const projectPath = path.join(process.cwd(), projectName);

  // Check if project folder already exists
  if (fs.existsSync(projectPath)) {
    console.error(chalk.red.bold(`❌ Project folder "${projectName}" already exists! Please choose a different name or remove the existing folder.`));
    process.exit(1);
  }

  console.log(chalk.blue(`\n📁 Creating project: ${chalk.cyan.bold(projectName)}`));

  // Create root project directory
  try {
    fs.mkdirSync(projectPath, { recursive: true });
    console.log(chalk.green(`✅ Created project directory: ${projectPath}`));
  } catch (error) {
    console.error(chalk.red(`❌ Error creating project directory:`, error.message));
    process.exit(1);
  }

  // Create subfolders
  folders.forEach((folder) => {
    try {
      fs.mkdirSync(path.join(projectPath, folder), { recursive: true });
    } catch (error) {
      console.error(chalk.red(`❌ Error creating folder ${folder}:`, error.message));
      process.exit(1);
    }
  });
  console.log(chalk.green("✅ Created project subfolders."));

  // Create files
  Object.entries(files).forEach(([file, content]) => {
    try {
      fs.writeFileSync(path.join(projectPath, file), content, "utf8");
    } catch (error) {
      console.error(chalk.red(`❌ Error creating file ${file}:`, error.message));
      process.exit(1);
    }
  });
  console.log(chalk.green("✅ Created project files."));

  // Create .env file
  createEnvFile(projectPath, dbChoice);

  // Define package.json content
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "A simple Express MVC application generated by CEMVC.",
    type: "module",
    main: "app.js",
    scripts: {
      dev: "nodemon app.js", // Added nodemon for development
      start: "node app.js"
    },
    dependencies: {
      express: "^4.19.2", // Updated Express version
      nunjucks: "^3.2.4",
      dotenv: "^16.4.5", // Updated dotenv version
      chalk: "^5.3.0",
      figlet: "^1.5.2",
      ...(dbChoice === "mongo" && { mongoose: "^8.4.1" }), // Conditionally add mongoose
      ...(dbChoice === "mysql" && { "mysql2/promise": "^0.0.0" }) // Conditionally add mysql2/promise (version placeholder)
    },
    devDependencies: {
      nodemon: "^3.1.3" // Updated nodemon version
    }
  };

  try {
    fs.writeFileSync(path.join(projectPath, "package.json"), JSON.stringify(packageJson, null, 2), "utf8");
    console.log(chalk.green("✅ package.json created successfully!"));
  } catch (error) {
    console.error(chalk.red(`❌ Error creating package.json:`, error.message));
    process.exit(1);
  }

  console.log(chalk.green("\n📦 Installing dependencies. This might take a moment...\n"));

  try {
    // Install all dependencies defined in package.json
    execSync("npm install", { cwd: projectPath, stdio: "inherit" });
    console.log(chalk.greenBright("\n✅ Express MVC Project Created Successfully!\n"));
    console.log(chalk.cyan(`👉 Get started by typing:\n   cd ${projectName}\n   npm run dev`));
  } catch (error) {
    console.error(chalk.red("\n❌ Failed to install dependencies."));
    console.error(chalk.yellow("Please navigate to your project folder:"));
    console.error(chalk.yellow(`cd ${projectName}`));
    console.error(chalk.yellow("And run 'npm install' manually."));
  }
}

/**
 * Prompts the user to choose a database.
 * @param {function} callback - Callback function to execute with the chosen database.
 */
function askDatabaseChoice(callback) {
  console.clear();
  console.log(chalk.blueBright(figlet.textSync("CEMVC", { horizontalLayout: "full" })));
  console.log(chalk.greenBright("🚀 Welcome to CEMVC - Express MVC Generator\n"));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(chalk.yellow("🔍 Choose your preferred database (MySQL / MongoDB): "), (dbChoice) => {
    dbChoice = dbChoice.toLowerCase().trim();
    if (dbChoice !== "mysql" && dbChoice !== "mongo" && dbChoice !== "mongodb") {
      console.log(chalk.red("⚠️ Invalid choice! Please enter 'mysql' or 'mongodb'. Defaulting to MySQL..."));
      dbChoice = "mysql";
    } else if (dbChoice === "mongodb") {
      dbChoice = "mongo"; // Standardize to 'mongo' for internal use
    }
    rl.close();
    callback(dbChoice);
  });
}

// Main execution flow
const projectName = process.argv[2] || "my-express-app";
askDatabaseChoice((dbChoice) => {
  createProject(projectName, dbChoice);
});