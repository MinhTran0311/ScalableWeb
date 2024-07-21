import { postgres } from "../deps.js";

const sql = postgres({});

const getTodo = async (id) => {
  const items = await sql`SELECT * FROM todos WHERE id = ${id}`;
  return items[0];
};

const getTodos = async () => {
  return await sql`SELECT * FROM todos`;
};

const addTodo = async (todo) => {
  await sql`INSERT INTO todos (item) VALUES (${todo})`;
};

export { getTodo, getTodos, addTodo };