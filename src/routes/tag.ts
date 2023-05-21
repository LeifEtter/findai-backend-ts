import express from "express";
import checkValid from "../helpers/check-valid";
import val from "../helpers/validation";
import { createTag, syncTags } from "../controllers/tag-controller";

const tagRouter: express.Router = express.Router();

tagRouter.route("/").post(checkValid(val.createTag), createTag);
tagRouter.route("/sync").get(syncTags);

export default tagRouter;
