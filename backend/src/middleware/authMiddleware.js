import jwt from "jsonwebtoken";

/**
 * Basic authentication middleware
 * Verifies JWT and attaches user info to req.user
 */
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // includes { id, role }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Role-based authorization middleware
 * Example usage:
 * router.put("/:id/status", authMiddleware, authorizeRoles("admin", "manager"), updateTicketStatus);
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied: insufficient permissions" });

    next();
  };
};
