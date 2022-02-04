const { request } = require("express");
const express = require("express");
const app = express();

const users = [];

const { PrismaClient } = require("@prisma/client");
const { user } = new PrismaClient();

app.use(express.json());

app.listen(5000, () => {
  console.log("geia sou xrhsto magka");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const userExist = await user.findFirst({
    where: { username, password },
    select: {
      id: true,
      username: true,
    },
  });
  console.log(userExist);
  if (!userExist) {
    return res.status(401).send("ekanes malakia");
  }

  console.log(username, password);
  res.status(200).send(userExist);
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const userExist = await user.findUnique({
    where: { username },
  });

  if (userExist) {
    return res.status(409).send("ekanes malakia");
  }

  const newUser = await user.create({
    data: {
      username,
      password,
    },
    select: {
      id: true,
      username: true,
    },
  });

  res.status(200).send(newUser);
});
