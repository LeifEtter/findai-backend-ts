import {send} from "process";
import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/db";
import {userInfo} from "os";

afterAll(
  async () => await prisma.user.delete({where: {email: "ayodeji@test.com"}})
);
describe("Testing of the tool routes", () => {
  const user = {
    biography: "nothing",
    email: "ayodeji@test.com",
    password: "Test@1234",
    profileImage: "http://google.com",
    name: "Ayodeji Fakunle",
  };

  const badUser = {
    profileImage: "http://google.com",
    password: "123456",
    role: "USER",
    image: "image",
  };
  it("POST/ Validate and Create a User", async () => {
    const response = await request(app)
      .post("/test/user/register")
      .send(user)
      .expect(201)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual(
      expect.objectContaining({
        message:
          "An Email with your verification code has been sent, please use the user/verify route and provide you're user id and code",
        userId: expect.any(Number),
      })
    );
  });

  it("POST/ Should not Add Duplicate User", async () => {
    const response = await request(app)
      .post("/test/user/register")
      .send(user)
      .expect(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Email is already in use",
      })
    );
  });
  //   it("GET/ Should Log a User in", async () => {
  //     const response = await request(app)
  //       .get(`/test/user/login`)
  //       .send({email: user.email, password: user.password})
  //       .expect(200);
  //     expect(response.body).toEqual(
  //       expect.objectContaining({
  //         id: expect.any(String),
  //         token: expect.any(String),
  //       })
  //     );
  //     console.log(response);
  //   });

  it("POST/ Should not Validate or Create a User Input", async () => {
    const response = await request(app)
      .post("/test/user/register")
      .send(badUser)
      .expect(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      })
    );
  });
});
