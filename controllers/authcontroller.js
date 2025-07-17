const user = require("../model/User");
const Role = require("../model/Role");
const userRole = require("../model/User_Role");
const Task = require("../model/Task");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const { Op} = require("sequelize");

const transporter = require("../config/emailConfig");

const crypto = require("crypto");

const { createUserRole } = require("../service/user_role");
const User_Role = require("../model/User_Role");

const admin = require("../config/firebaseAdmin");

const generator = require("generate-password");

const password = generator.generate({
  length: 7,
  numbers: true,
});

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
      is_active: true,
    });
    if (!newUser) {
      return res.status(500).json({ message: "User registration failed" });
    }
    const roleData = 2;
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
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const handlelogin = async (req, res, expectedrole) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }
  try {
    const existingUser = await user.findOne({ where: { email } });

    if (!existingUser) {
      // return res.status(400).json({ message: "Invalid email or password" });
      await user.create;
    }

    if (existingUser.password === null || existingUser.password === undefined) {
      return res
        .status(400)
        .json({ message: "Please use Google Sign-In for this account." });
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

    const userRoleIdEntry = await User_Role.findOne({
      where: {
        user_id: existingUser.id,
      },
    });

    if (!userRoleIdEntry) {
      return res.status(400).json({ message: "User role not assigned." });
    }

    const userRole = await Role.findOne({
      where: {
        id: userRoleIdEntry.role_id,
      },
    });

    if (!userRole || userRole.title !== expectedrole) {
      return res.status(400).json({ message: "Invalid User Role" });
    }

    const token = jsonwebtoken.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "4 h" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "Google ID token is required." });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decodedToken;

    let existingUser = await user.findOne({ where: { email } });

    if (!existingUser) {
      const generatedPassword = crypto.randomBytes(8).toString("hex");
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      existingUser = await user.create({
        name: name || email.split("@")[0],
        email: email,
        password: hashedPassword,
        is_active: true,
        google_uid: uid,
      });

      if (!existingUser) {
        return res
          .status(500)
          .json({ message: "User creation failed after Google login." });
      }

      const defaultRoleId = 2;
      await createUserRole(existingUser.id, defaultRoleId);
      console.log(
        `New Google user ${email} registered with role ${defaultRoleId}.`
      );

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: existingUser.email,
        subject: "Welcome to Our Service! Your Account Details",
        html: `
          <p>Dear ${existingUser.name || "User"},</p>
          <p>Welcome to our service! We're thrilled to have you.</p>
          <p>Your account has been successfully created. Here are your login details:</p>
          <p><strong>Email:</strong> ${existingUser.email}</p>
          <p><strong>Password:</strong> ${generatedPassword}</p>
          <p>For security reasons, we highly recommend changing your password after your first login.</p>
          <p>Thank you for joining us!</p>
          <p>The Team</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${existingUser.email}`);
      } catch (emailError) {
        console.error(
          `Error sending welcome email to ${existingUser.email}:`,
          emailError
        );
      }
    } else {
      if (!existingUser.is_active) {
       return res
        .status(401)
        .json({ message: "User Inactive." });
      }

      if (existingUser.name !== name) {
        await existingUser.update({ name: name });
      }

      if (!existingUser.google_uid) {
        await existingUser.update({ google_uid: uid });
      }
      console.log(`Existing user ${email} logged in via Google.`);
    }

    const appToken = jsonwebtoken.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "4 h" }
    );

    res.status(200).json({
      message: "Google login successful",
      token: appToken,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.error("Error during Google login:", error);
    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ message: "Google ID token expired. Please sign in again." });
    }
    return res.status(500).json({
      message: "Server error during Google login",
      error: error.message,
    });
  }
};

const getuser = async (req, res) => {
  const { page, limit } = req.query;
  try {
    const pageNumber = parseInt(page) || 1;
    const itemsPerPage = parseInt(limit) || 10;
    const offset = (pageNumber - 1) * itemsPerPage;
    const userrole = await userRole.findAll({ where: { role_id: 2 } });
    const userIds = userrole.map((ur) => ur.user_id);
    const users = await user.findAll({
      where: { is_active: true, id: userIds },
      limit: itemsPerPage,
      offset: offset,
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getalluser = async (req, res) => {
  try {
    const userdata = {};

    const [userRoleDataForUsers, userRoleDataForAdmins] = await Promise.all([
      userRole.findAll({
        where: { role_id: 2 },
        attributes: ["user_id"],
        raw: true,
      }),
      userRole.findAll({
        where: { role_id: 1 },
        attributes: ["user_id"],
        raw: true,
      }),
    ]);

    const userIds = userRoleDataForUsers.map((ur) => ur.user_id);
    const adminIds = userRoleDataForAdmins.map((ur) => ur.user_id);

    const [
      activeUsersCount,
      inactiveUsersCount,
      activeAdminsCount,
      inactiveAdminsCount,
    ] = await Promise.all([
      user.count({ where: { id: { [Op.in]: userIds }, is_active: true } }),
      user.count({ where: { id: { [Op.in]: userIds }, is_active: false } }),
      user.count({ where: { id: { [Op.in]: adminIds }, is_active: true } }),
      user.count({ where: { id: { [Op.in]: adminIds }, is_active: false } }),
    ]);
    userdata.users = userIds.length;
    userdata.admin = adminIds.length;
    userdata.usersactive = activeUsersCount;
    userdata.usersinactive = inactiveUsersCount;
    userdata.adminactive = activeAdminsCount;
    userdata.admininactive = inactiveAdminsCount;

    res.status(200).json(userdata);
  } catch (error) {
    console.error("Error in getalluser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    res.status(500).json({ message: "Server error", error: error.message });
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
    // Only update password if provided and not null
    const updateFields = { name, email };
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await userData.update(updateFields);
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    // await userData.destroy(); // Use soft delete as per original code
    await userData.update({ is_active: false });
    res
      .status(200)
      .json({ message: "User deleted successfully (soft delete)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const tokenvalidate = async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(403).json({ message: "token not found " });
    }
    const userdata = await user.findByPk(decoded.id);
    if (!userdata || !userdata.is_active) {
      return res.status(403).json({ message: "user not found " });
    }
    const expTime = new Date(decoded.exp * 1000);
    const currentTime = new Date();
    const timeUntilExpiry = expTime.getTime() - currentTime.getTime();

    // Check if timeUntilExpiry is less than or equal to a small threshold (e.g., 1 second)
    // as it might not be exactly 0 due to floating point precision or immediate expiry
    if (timeUntilExpiry <= 1000) {
      // Check if less than or equal to 1 second
      return res.status(498).json({ message: "token expired " });
    }

    const userrole = await userRole.findOne({
      where: { user_id: decoded.id },
    });
    if (!userrole) {
      return res.status(403).json({ message: "User role not found" });
    }

    const role = await Role.findOne({
      where: { id: userrole.role_id, is_active: true },
    });
    if (!role) {
      return res.status(403).json({ message: "Role not found or inactive" });
    }
    // console.log(role);
    const roletitle = role.title;
    const username = userdata.name;
    return res
      .status(200)
      .json({ message: "token validate", roletitle, username });
  } catch (e) {
    console.error(e);
    // Handle specific JWT errors
    if (e.name === "TokenExpiredError") {
      return res.status(498).json({ message: "token expired " });
    }
    if (e.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

const taskByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const userdata = await user.findOne({
      where: { id, is_active: true },
    });
    if (!userdata) {
      return res.status(404).json({ message: "User not found" });
    }
    const task = await Task.findAll({
      where: { created_by: id, is_active: true },
    });

    res.status(200).json({ message: "Task by User", task });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

const userlogin = async (req, res) => {
  handlelogin(req, res, "User");
};
const adminlogin = async (req, res) => {
  handlelogin(req, res, "Admin");
};

module.exports = {
  register,
  getuser,
  getUserById,
  updateUser,
  deleteUser,
  userlogin,
  tokenvalidate,
  taskByUserId,
  getalluser,
  adminlogin,
  googleLogin,
};
