const user = require("../model/User");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

const { createUserRole } = require("../service/user_role");

const register = async (req, res) => {
  const { name, email, password, title } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }
  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await user.create({
      name,
      email,
      password: hashedPassword,
    });
    if (!newUser) {
      return res.status(500).json({ message: "User registration failed" });
    }
    const roleData = req.role_id;
    console.log("role id", roleData, newUser.id);

    createUserRole(newUser.id, roleData)
      .then(() => {
        console.log("User role created successfully");
      })
      .catch((error) => {
        console.error("Error creating user role:", error);
      });
    res
      .status(201)
      .json({ message: "User  registered successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }
  try {
    const existingUser = await user.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (!existingUser.is_active) {
      return res.status(400).json({ message: "User is inactive" });
    }

    const token = jsonwebtoken.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getuser = async (req, res) => {
  try {
    const users = await user.findAll();
    users.forEach((user) => {
      if (!user.is_active) {
        user.is_active = false;
      }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const userData = await user.findByPk(id);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!userData.is_active) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
    const userData = await user.findByPk(id);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedUser = await userData.update({
      name,
      email,
      password: password ? await bcrypt.hash(password, 10) : userData.password,
    });
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userData = await user.findByPk(id);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!userData.is_active) {
      return res.status(400).json({ message: "User already deleted" });
    }
    await userData.update({ is_active: false });
    res
      .status(200)
      .json({ message: "User deleted successfully (soft delete)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  register,
  getuser,
  getUserById,
  updateUser,
  deleteUser,
  login,
};
