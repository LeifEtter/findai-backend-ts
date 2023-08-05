import {send} from "process";
import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/db";
import {userInfo} from "os";
import {response} from "express";

describe("Testing of the tool routes", () => {
  let token: string;
  const adminUser = {
    email: "ayo@test.com",
    password: "Test@1234",
  };

  it("GET/ Should Log a Admin User in", async () => {
    const response = await request(app)
      .get(`/test/user/login`)
      .send({email: adminUser.email, password: adminUser.password})
      .expect(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
      })
    );
    token = response.body.token;
  });

  it("GET/ Should sync tools with airtable", async () => {
    const response = await request(app)
      .get(`/test/tools/sync`)
      .set("authorization", token)
      .expect(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Successfully synced tools with airtable",
        incompleteTool: [],
      })
    );
  });
  it("GET/ Should Not sync tools with airtable when a user do not have a token", async () => {
    const response = await request(app)
      .get(`/test/tools/sync`)
      .set("authorization", "skksk")
      .expect(403);
    expect(response.body).toEqual(
      expect.objectContaining({
        message:
          "Your token can't be verified, the time of validity might have passed",
      })
    );
  });
});
