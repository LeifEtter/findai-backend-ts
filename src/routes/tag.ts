import express from "express";
import { getTag, syncTagsWithAirtable } from "../controllers/tag-controller";

const tagRouter: express.Router = express.Router();

tagRouter.route("/sync").get(syncTagsWithAirtable);
tagRouter.route("/:id").get(getTag);

export default tagRouter;
