import express from "express";
import { getTag, syncTags } from "../controllers/tag-controller";

const tagRouter: express.Router = express.Router();

tagRouter.route("/sync").get(syncTags);
tagRouter.route("/:id").get(getTag);

export default tagRouter;
