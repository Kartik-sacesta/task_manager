require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
const { connectDB, sequelize } = require("./config/db");
const authRoutes = require("./routes/authroute");
const taskcontroller = require("./routes/taskroute");
const rolecontroller = require("./routes/roleroute");
const taskcommentsroute = require("./routes/taskcommentsroute");
const categorycontroller = require("./routes/categoryroute");
const subcategoryroutes = require("./routes/subcategoryroute");
const defineAssociations = require("./model/associations");
defineAssociations(); 
connectDB();
sequelize.sync({ force: false });

const allowedOrigins = [
  "http://localhost:5173",
  "https://task-manager-frontend-plum.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/user", authRoutes);
app.use("/task", taskcontroller);
app.use("/role", rolecontroller);
app.use("/taskcomments", taskcommentsroute);
app.use("/category", categorycontroller);
app.use("/subcategory", subcategoryroutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
 