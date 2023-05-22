import express from "express";
import {
  deleteSingleToolById,
  getSingleToolById,
  getToolsByQuery,
  syncToolsWithAirtable,
  updateSingleToolById,
} from "../controllers/tool-controller";
import checkValid from "../helpers/validation";
import val from "../helpers/validator-schemas";

const toolRouter: express.Router = express.Router();

toolRouter.route("/sync").get(syncToolsWithAirtable);
toolRouter.route("/").get(getToolsByQuery);
toolRouter.route("/:id").put(checkValid(val.createTool), updateSingleToolById);
toolRouter.route("/:id").delete(deleteSingleToolById);
toolRouter.route("/:id").get(getSingleToolById);

export default toolRouter;
