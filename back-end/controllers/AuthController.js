const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { user } = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
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
    const username = userExist.username;
    const token = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "2h",
    });

    const refreshToken = jwt.sign(
      { username },
      process.env.REFRESH_TOKEN_SECRET
    );

    res.status(200).send({
      id: userExist.id,
      username: userExist.username,
      token: token,
      refreshToken,
    });
  });
});

router.post("/register", async (req, res) => {
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

    res.status(201).send(newUser);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
