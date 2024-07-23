import * as todoService from "./services/todoService.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";

const portConfig = { port: 7777 };

const cachedTodoService = cacheMethodCalls(todoService, ["addTodo", "deleteTodo"]);

const handleGetTodo = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  return Response.json(await cachedTodoService.getTodo(id));
};

const handleGetTodos = async (request) => {
  return Response.json(await cachedTodoService.getTodos());
};

const handlePostTodos = async (request) => {
  const todo = await request.json();

  await cachedTodoService.addTodo(todo.todo);
  return new Response("OK", { status: 200 });
};

const handleDeleteTodoById = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  const result = cachedTodoService.deleteTodo(id);
  if (result.count === 0) {
    return new Response("Todo not found", { status: 404 });
  }
  return new Response("Todo deleted", { status: 200 });
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
    fn: handleGetTodo,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handlePostTodos,
  },
  {
    method: "DELETE",
    pattern: new URLPattern({ pathname: "/todos/:id" }),
    fn: handleDeleteTodoById,
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
