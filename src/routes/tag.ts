import express from "express";
import {
  getAllTags,
  getTag,
  syncTagsWithAirtable,
} from "../controllers/tag-controller";

const tagRouter: express.Router = express.Router();

tagRouter.route("/").get(getAllTags);
tagRouter.route("/sync").get(syncTagsWithAirtable);
tagRouter.route("/:id").get(getTag);

export default tagRouter;
