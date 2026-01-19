import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.id; // Adds user ID from token to request
      next();
    } catch (error) {
      res.status(401).json({ success: false, msg: "Not authorized" });
    }
  } else {
    res.status(401).json({ success: false, msg: "No token provided" });
  }
};