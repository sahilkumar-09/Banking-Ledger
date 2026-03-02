import users from "../models/user.model.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split("")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, token is missing",
      });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await users.findById(decoded.userid);
        console.log(user)

      req.user = user;

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, token is invalid",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal sever error",
      error: error.message,
    });
  }
};

export { authMiddleware };
