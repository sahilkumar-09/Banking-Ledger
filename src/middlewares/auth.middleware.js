import users from "../models/user.model.js";
import jwt from "jsonwebtoken";
import tokenBlacklists from "../models/blacklist.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, token is missing",
      });
    }

    const isBlackListed = await tokenBlacklists.findOne({ token });

    if (isBlackListed) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, token is invalid",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await users.findById(decoded.userid);

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

const authSystemMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, token is missing",
      });
    }

    const isBlackListed = await tokenBlacklists.findOne({ token });

    if (isBlackListed) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, token is invalid",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await users.findById(decoded.userid).select("+systemUser");

      if (!user) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access, not a system user",
        });
      }

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
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { authMiddleware, authSystemMiddleware };
