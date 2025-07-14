const { Sequelize } = require("sequelize");
const dotenv = require('dotenv'); // Make sure dotenv is installed: npm install dotenv
dotenv.config(); // Load environment variables from .env file for local development

let sequelize;

// Check if DATABASE_URL environment variable is present (provided by Render for PostgreSQL)
if (process.env.DATABASE_URL) {
  // Use PostgreSQL for Render deployment
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true, // Enforce SSL connection
        rejectUnauthorized: false // Required for Render's managed PostgreSQL
      }
    },
    logging: false, // Set to true to see SQL queries in console (useful for debugging)
    // Other options like pool size can be added here
  });
  console.log("Using PostgreSQL database configuration.");
} else {
  // Fallback to MySQL for local development if DATABASE_URL is not set
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "mysql",
      logging: false, // Set to true to see SQL queries in console (useful for debugging)
    }
  );
  console.log("Using MySQL database configuration (local).");
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    // Optionally, run migrations here if you don't use a postdeploy script
    // await sequelize.sync({ alter: true }); // Use alter: true carefully in production
    // console.log("Database synchronized.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    // Exit the process if database connection is critical for your app
    // process.exit(1);
  }
};

module.exports = { connectDB, sequelize };
