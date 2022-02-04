//const { request } = require("express");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

const users = [];

const { PrismaClient } = require("@prisma/client");
const { user } = new PrismaClient();

app.use(express.json());

app.listen(5000, () => {
  console.log("OK");
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

  if (!(await bcrypt.compare(password, userExist.password))) {
    return res.status(401).send("ekanes malakia");
  }
  res.status(200).send({ id: userExist.id, username: userExist.username });
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
