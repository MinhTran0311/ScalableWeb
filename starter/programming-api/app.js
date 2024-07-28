import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import { serve } from "./deps.js";
import { sql } from "./database/database.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";
import * as assignmentService from "./services/programmingAssignmentService.js";

const cachedService = cacheMethodCalls(assignmentService, ["submitAssignment"]);

const portConfig = { port: 7777, hostname: "0.0.0.0" };

// const handleRequest = async (request) => {
//   const programmingAssignments = await programmingAssignmentService.findAll();

//   const requestData = await request.json();
//   const testCode = programmingAssignments[0]["test_code"];
//   const data = {
//     testCode: testCode,
//     code: requestData.code,
//   };

//   const response = await fetch("http://grader-api:7000/", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   return response;
// };

// serve(handleRequest, portConfig);

const handleGetAssignments = async (request) => {
  return Response.json(await cachedService.findAll());
};

const handleGetAssignment = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  return Response.json(await cachedService.findAssignmentById(id));
};

const handleSubmitAssignment = async (request) => {
  const programmingAssignments = await programmingAssignmentService.findAll();

  const requestData = await request.json();
  const testCode = programmingAssignments[0]["test_code"];
  const data = {
    testCode: testCode,
    code: requestData.code,
  };
  const response = await fetch("http://grader-api:7000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response
  // return new Response.json(await cachedService.submitAssignment(data), {
  //   status: 200,
  // });
};

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/assignments" }),
    fn: handleGetAssignments,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/assignments/:id" }),
    fn: handleGetAssignment,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/assignments" }),
    fn: handleSubmitAssignment,
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
