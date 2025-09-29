import jwt from "jsonwebtoken";

export const authenticateToken = (request, response, next) => {
  const authHeader = request.headers["authorization"]; // reading  from the header
  if (!authHeader)
    return response.status(401).json({ msg: "token is missing" });
  // const token = authHeader && authHeader.split(' ')[1];
  let token = authHeader.includes(" ") ? authHeader.split(" ")[1] : authHeader;
  if (!token) return res.status(401).json({ msg: "token is missing" });
  token = token.trim();
  jwt.verify(token, process.env.ACCESS_SECRET_KEY, (error, user) => {
    if (error) {
      return response.status(403).json({ msg: "invalid token" });
    }

    request.user = user;
    next();
  });
};
