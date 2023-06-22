// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('Peanuts', 'Charlie Brown', 'Old Comic in Sunday Paper') RETURNING code, name, description`
  );
  testCompany = result.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] });
  });
});

describe("GET /companies/:code", () => {
  test("Gets a single company", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: testCompany });
  });
  test("Responds with 404 for invalid code", async () => {
    const res = await request(app).get(`/companies/0`);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("Creates a single company", async () => {
    const res = await request(app).post("/companies").send({
      code: "Piggy",
      name: "pig.io",
      description: "we make great bacon",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: expect.any(String),
        name: "pig.io",
        description: "we make great bacon",
      },
    });
  });
});

describe("PUT /companies/:code", () => {
  test("Updates a single company", async () => {
    const res = await request(app)
      .put(`/companies/${testCompany.code}`)
      .send({ name: "BillyBob", description: "Angelina Jolie's ex" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: testCompany.code,
        name: "BillyBob",
        description: "Angelina Jolie's ex",
      },
    });
  });
  test("Responds with 404 for invalid code", async () => {
    const res = await request(app)
      .put(`/companies/0`)
      .send({ name: "BillyBob", description: "Angelina Jolie's ex" });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
  test("Deletes a single company", async () => {
    const res = await request(app).delete(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "DELETED!" });
  });
});
