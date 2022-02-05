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
  res.status(200).send("successfull authorization");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const userExist = await user.findFirst({
    where: { username },
    select: {
      id: true,
      username: true,
      password: true,
    },
  });

  if (!userExist) {
    return res.status(401).send("ekanes malakia");
  }

  bcrypt.compare(password, userExist.password, (error, response) => {
    if (error) {
      res.status(401).send("ekanes malakia");
    }
    const u = userExist;
    const token = jwt.sign(u, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 300,
    });

    res
      .status(200)
      .send({ id: userExist.id, username: userExist.username, token: token });
  });
});

app.post("/register", async (req, res) => {
  const hashedPass = await bcrypt.hash(req.body.password, 10);
  const username = req.body.username;
  //const { username, password } = req.body;

  const userExist = await user.findUnique({
    where: { username },
  });

  if (userExist) {
    return res.status(409).send("ekanes malakia");
  }

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

  res.status(200).send(newUser);
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.status(401).send("ekanes malakia");
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
