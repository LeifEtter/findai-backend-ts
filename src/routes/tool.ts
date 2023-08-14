import express from "express";
import {
  bookmarkTool,
  deleteSingleToolById,
  getSingleToolById,
  getToolsByQuery,
  syncToolsWithAirtable,
  unbookmarkTool,
  updateSingleToolById,
} from "../controllers/tool-controller";
import checkValid from "../helpers/validation";
import val from "../helpers/validator-schemas";
import auth from "../helpers/authentication";
import minRole from "../helpers/authorization";
import {Role} from "@prisma/client";

const toolRouter: express.Router = express.Router();

toolRouter.route("/sync").get(auth, minRole(Role.ADMIN), syncToolsWithAirtable);
toolRouter.route("/bookmark/:id").patch(auth, bookmarkTool);
toolRouter.route("/unbookmark/:id").patch(auth, unbookmarkTool);
toolRouter.route("/").get(getToolsByQuery);
toolRouter.route("/:id").put(checkValid(val.createTool), updateSingleToolById);
toolRouter.route("/:id").delete(deleteSingleToolById);
toolRouter.route("/:id").get(getSingleToolById);

export default toolRouter;
