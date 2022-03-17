const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((user) => user.username === username);

  if (!userExists) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  request.username = username;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({
      error: "Mensagem do erro",
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const currentUser = users.find((user) => user.username === username);

  return response.status(200).json(currentUser.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const currentUser = users.find((user) => user.username === username);

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  currentUser.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { username } = request;

  const currentUser = users.find((user) => user.username === username);

  const currentTodo = currentUser.todos.find((todo) => todo.id === id);

  if (!currentTodo) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  currentTodo.title = title;
  currentTodo.deadline = deadline;

  return response.status(200).json(currentTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const currentUser = users.find((user) => user.username === username);

  const currentTodo = currentUser.todos.find((todo) => todo.id === id);

  if (!currentTodo) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  currentTodo.done = true;

  return response.status(200).json(currentTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const currentUser = users.find((user) => user.username === username);

  const currentTodo = currentUser.todos.find((todo) => todo.id === id);

  if (!currentTodo) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  currentUser.todos.splice(currentTodo, 1);

  return response.status(204).json(currentUser.todos);
});

module.exports = app;
