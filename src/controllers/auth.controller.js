import users from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../services/email.service.js";

const registerController = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, Name and Password are required",
      });
    }

    const isExists = await users.findOne({
      email: email,
    });

    if (isExists) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await users.create({
      email,
      name,
      password,
    });

    const token = jwt.sign(
      {
        userid: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        email: user.email,
        name: user.name,
      },
      token
    });

    await sendRegistrationEmail(user.email, user.name)
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password must be required",
      });
    }

    const user = await users.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await user.comparePassword(password)

      if (!isValidPassword) {
          return res.status(401).json({
              success: false,
              message: "Invalid password"
          })
      }

      const token = jwt.sign(
        {
          userid: user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        },
      );

      res.cookie("token", token);

      res.status(200).json({
        success: true,
        message: "User loggedIn successfully",
        user: {
          email: user.email,
          name: user.name,
        },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { registerController, loginController };
