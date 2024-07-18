import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const portConfig = { port: 7777 };

const sql = postgres({
  user: 'minhtran',
  password: 999999,
  database: 'mydatabase',
  hostname: 'localhost',
  port: 5432,
});

const handleGetTodos = async () => {
  const items = await sql`SELECT * FROM todos`;
  return new Response(JSON.stringify(items));
};

const handleGetTodoById = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  const items = await sql`SELECT * FROM todos WHERE id = ${id}`;
  if (items.length === 0) {
    return new Response("Todo not found", { status: 404 });
  }
  return new Response(JSON.stringify(items[0]));
};

const handleok = async (request, urlPatternResult) => {
  
  return new Response("12312");
};

const handlePostTodos = async (request) => {
  let item;
  try {
    item = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!item || !item.item) {
    return new Response("Item is required", { status: 400 });
  }

  await sql`INSERT INTO todos (item) VALUES (${item.item})`;
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
    method: "POST",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handlePostTodos,
  },
  {
    method:"GET",
    pattern: new URLPattern({ pathname: "/ok" }),
    fn: handleok,

  }
];

const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) => um.method === request.method && um.pattern.test(request.url)
  );

  if (!mapping) {
    return new Response("Not found", { status: 404 });
  }

  const mappingResult = mapping.pattern.exec(request.url);
  return await mapping.fn(request, mappingResult);
};
const handleHttpConnection = async (conn) => {
  for await (const requestEvent of Deno.serveHttp(conn)) {
    requestEvent.respondWith(await handleRequest(requestEvent.request));
  }
};

for await (const conn of Deno.listen(portConfig)) {
  handleHttpConnection(conn);
}
