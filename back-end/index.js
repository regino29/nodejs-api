require("dotenv").config();
const express = require("express");
const app = express();

const authRouter = require("./controllers/AuthController");
const todoRouter = require("./controllers/TodoController");

app.use(express.json());

app.listen(5000, () => {
  console.log("OK");
});

app.use(require("./middleware/auth"));

app.use("/auth", authRouter);
app.use("/todos", todoRouter);
