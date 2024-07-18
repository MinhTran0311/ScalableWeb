import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";
import * as todoService from "./services/todoService.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";

const portConfig = { port: 7777 };

const cachedTodoService = cacheMethodCalls(todoService, ["addTodo"]);

const SERVER_ID = crypto.randomUUID();
const handleGetRoot = async (request) => {
  return new Response(`Hello from ${SERVER_ID}`);
};

const handleGetTodos = async () => {
  return new Response(JSON.stringify(cachedTodoService.getTodos()));
};

const handleGetTodoById = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  const todo = cachedTodoService.getTodo(id);
  if (!todo) {
    return new Response("Todo not found", { status: 404 });
  }
  return new Response(JSON.stringify(todo));
};

const handleDeleteTodoById = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  const result = cachedTodoService.deleteTodo(id);
  if (result.count === 0) {
    return new Response("Todo not found", { status: 404 });
  }
  return new Response("Todo deleted", { status: 200 });
};

const handlePostTodos = async (request) => {
  let todo;
  try {
    todo = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }


  if (!todo || !todo.todo) {
    return new Response("Todo is required", { status: 400 });
  }

  await cachedTodoService.addTodo(todo);
  return new Response("OK", { status: 200 });
};

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handleGetTodos,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/todos/:id" }),
    fn: handleGetTodoById,
  },
  {
    method: "DELETE",
    pattern: new URLPattern({ pathname: "/todos/:id" }),
    fn: handleDeleteTodoById,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handlePostTodos,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/ok" }),
    fn: handleok,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/" }),
    fn: handleGetRoot,
  },
];

const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) => um.method === request.method && um.pattern.test(request.url)
  );

  if (!mapping) {
    return new Response("Not found", { status: 404 });
  }

  const mappingResult = mapping.pattern.exec(request.url);
  try {
    return await mapping.fn(request, mappingResult);
  } catch (e) {
    console.log(e);
    return new Response(e.stack, { status: 500 });
  }
};
const handleHttpConnection = async (conn) => {
  for await (const requestEvent of Deno.serveHttp(conn)) {
    requestEvent.respondWith(await handleRequest(requestEvent.request));
  }
};

for await (const conn of Deno.listen(portConfig)) {
  handleHttpConnection(conn);
}
