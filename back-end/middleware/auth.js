const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { user } = new PrismaClient();

const config = process.env;

const verifyToken = async (req, res, next) => {
  if (req.url.startsWith("/auth")) {
    return next();
  }

  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    req.userId = await findAndVerifyUser(token);
  } catch (error) {
    return res.status(401).send("Invalid Token");
  }

  return next();
};

const findAndVerifyUser = async (token) => {
  const { username } = await jwt.verify(token, config.ACCESS_TOKEN_SECRET);

  const userExist = await user.findFirst({
    where: { username },
    select: {
      id: true,
      username: true,
    },
  });

  if (!userExist) {
    throw new Error("User doesn't exist");
  }
  return userExist.id;
};

module.exports = verifyToken;
