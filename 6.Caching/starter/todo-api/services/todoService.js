import { postgres } from "../deps.js";

const sql = postgres({});

const getTodo = async (id) => {
  const items = await sql`SELECT * FROM todos WHERE id = ${id}`;
  return items[0];
};

const getTodos = async () => {
  return await sql`SELECT * FROM todos`;
};

const addTodo = async (item) => {
  console.log(item);
  await sql`INSERT INTO todos (item) VALUES (${item})`;
};

const deleteTodo = async (id) => {
  return await sql`DELETE FROM todos WHERE id = ${id} RETURNING *`;
}

export { getTodo, getTodos, addTodo, deleteTodo };