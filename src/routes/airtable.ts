import express from "express";
import { syncTagsAndToolsWithAirtable } from "../controllers/airtable-controller";
import auth from "../helpers/authentication";
import minRole from "../helpers/authorization";
import { Role } from "@prisma/client";

const airtableRouter: express.Router = express.Router();

airtableRouter
  .route("/sync")
  .get(auth, minRole(Role.ADMIN), syncTagsAndToolsWithAirtable);

export default airtableRouter;
