import express from "express";
import {
  deleteSingleToolById,
  getSingleToolById,
  getToolsByQuery,
  syncAirtable,
} from "../controllers/tool_controller";

const toolRouter: express.Router = express.Router();

toolRouter.route("/sync").get(syncAirtable);
toolRouter.route("/").get(getToolsByQuery);
toolRouter.route("/:id").delete(deleteSingleToolById);
toolRouter.route("/:id").get(getSingleToolById);

export default toolRouter;
