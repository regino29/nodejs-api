require("dotenv").config();
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");
const { user } = new PrismaClient();

app.use(express.json());

app.listen(5000, () => {
  console.log("OK");
});

app.get("/users", verifyJWT, (req, res) => {
  res.status(200).send("Successfull Authorization");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    res.status(400).send("All input is required");
  }

  const userExist = await user.findFirst({
    where: { username },
    select: {
      id: true,
      username: true,
      password: true,
    },
  });

  if (!userExist) {
    return res.status(401).send("Invalid Credentials");
  }

  bcrypt.compare(password, userExist.password, (error, response) => {
    if (error) {
      res.status(401).send("Invalid Credentials");
    }
    const u = userExist.username;
    const token = jwt.sign({ u }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 25,
    });

    const refreshToken = jwt.sign({ u }, process.env.REFRESH_TOKEN_SECRET);

    res.status(200).send({
      id: userExist.id,
      username: userExist.username,
      token: token,
      refreshToken,
    });
  });
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      res.status(400).send("All input is required");
    }

    const oldUser = await user.findUnique({ where: { username } });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    const hashedPass = await bcrypt.hash(req.body.password, 10);

    const newUser = await user.create({
      data: {
        username,
        password: hashedPass,
      },
      select: {
        id: true,
        username: true,
      },
    });

    const token = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "2h",
    });

    newUser.token = token;

    res.status(201).json(newUser);
  } catch (err) {
    console.log(err);
  }
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.status(401).send("ekanes malakia");
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user.username;
    next();
  });
}
