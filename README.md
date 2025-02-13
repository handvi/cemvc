# CEMVC - Express MVC Generator  

🚀 **CEMVC** is a simple CLI tool to generate an Express.js project with an MVC structure. It helps developers quickly scaffold an Express application with a predefined folder structure, Nunjucks templating, and database configuration options.  

## ✨ Features  
- Automatically generates an **Express.js MVC** project.  
- Supports **MySQL** and **MongoDB** databases.  
- Preconfigured **Nunjucks** templating engine.  
- Comes with **dotenv** for environment variables.  
- Includes **Chalk** and **Figlet** for CLI styling.  
- Built-in **nodemon** support for development.  

## 📦 Installation  
To install **CEMVC**, run the following command:  
```sh
npm install -g cemvc
```  

## 🚀 Usage  
To create a new Express MVC project, run:  
```sh
cemvc my-app
```  
Then, follow the prompt to choose a database (**mysql** or **mongo**).  

### Run the Application  
```sh
cd my-app
npm run dev
```  
This will start the development server at:  
```
http://localhost:3000
```

## 📂 Project Structure  
After running **CEMVC**, your project will have the following structure:  
```
my-app/
│── config/         # Database configuration  
│── controllers/    # Controller files  
│── models/         # Data models  
│── public/         # Static assets (CSS, JS, Images)  
│── routes/         # Route files  
│── views/          # Nunjucks templates  
│── app.js          # Main application file  
│── .env            # Environment variables  
│── package.json    # Project dependencies  
```

## ⚙️ Configuration  
Create a **.env** file in the project root to store your environment variables:  

### MySQL Configuration  
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_DATABASE=mydatabase
PORT=3000
```  

### MongoDB Configuration  
```
DB_HOST=mongodb://localhost:27017/mydatabase
PORT=3000
```

## 📜 License  
This project is licensed under the **MIT License**.  

---
If you have problems or want to contribute, please create an Issue or Pull Request on GitHub! 😊
---
