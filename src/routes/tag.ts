import express from "express";
import checkValid from "../helpers/check-valid";
import val from "../helpers/validation";
import { createTag } from "../controllers/tag-controller";

const tagRouter: express.Router = express.Router();

tagRouter.route("/").post(checkValid(val.createTag), createTag);

export default tagRouter;
