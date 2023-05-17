import express from "express";
import { syncAirtable } from "../controllers/tool_controller";

const toolRouter: express.Router = express.Router();

toolRouter.route("/sync").get(syncAirtable);

export default toolRouter;
