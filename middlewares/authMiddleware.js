const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "Authorization header required" });
  }

  // Pastikan format: Bearer <token>
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Invalid authorization format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pastikan ID user ada
    if (!decoded.id) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    req.user = decoded; // req.user.id bisa dipakai
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};
