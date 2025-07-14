const { Sequelize } = require("sequelize");
const dotenv = require('dotenv');
dotenv.config(); 

let sequelize;


if (process.env.DATABASE_URL) {
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true, 
        rejectUnauthorized: false 
      }
    },
    logging: false, 
   
  });
  console.log("Using PostgreSQL database configuration.");
} else {
 
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "mysql",
      logging: false, 
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
