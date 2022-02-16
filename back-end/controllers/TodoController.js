const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { todo } = new PrismaClient();

router.post("/", async (req, res) => {
  const { title, description, important, deadline } = req.body;

  const newTodo = await todo.create({
    data: {
      title,
      description,
      important,
      deadline,
      authorId: req.userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      crearedAt: true,
      deadline: true,
      important: true,
    },
  });

  res.status(201).send(newTodo);
});

router.get("/", async (req, res) => {
  const todos = await todo.findMany({
    where: {
      authorId: req.userId,
      title: "nodejs",
    },
    select: {
      id: true,
      title: true,
      description: true,
      crearedAt: true,
      deadline: true,
      important: true,
    },
  });
  res.send(todos);
});

module.exports = router;
