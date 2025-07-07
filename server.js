require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
const { connectDB, sequelize } = require("./config/db");
const authRoutes = require("./routes/authroute");
const taskcontroller = require("./routes/taskroute");
const rolecontroller = require("./routes/roleroute");

connectDB();
sequelize.sync({ force: false });

app.use("/user", authRoutes);
app.use("/task", taskcontroller);
app.use("/role", rolecontroller);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
