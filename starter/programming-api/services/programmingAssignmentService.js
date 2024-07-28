import { sql } from "../database/database.js";

const findAll = async () => {
  return await sql`SELECT * FROM programming_assignments;`;
};

const findAssignmentById = async (id) => {
  return await sql`SELECT * FROM programming_assignments where id=${id}`;
};

const submitAssignment = async (data) => {
  const response = await fetch("http://grader-api:7000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  console.log(response)
  return response;
};

export { findAll, findAssignmentById, submitAssignment };
