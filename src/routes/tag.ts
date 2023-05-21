import express from "express";
import { syncTags } from "../controllers/tag-controller";

const tagRouter: express.Router = express.Router();

tagRouter.route("/sync").get(syncTags);

export default tagRouter;
