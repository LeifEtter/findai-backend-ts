import { Request, Response } from "express";
import * as dotenv from "dotenv";
import { AirtableTag } from "../models/airtable_models";
import prisma from "../db";
import logger from "../logger";
import { fetchTagsFromAirtable } from "./airtable-controller";
dotenv.config();

const unsyncAllTags = async () => {
  await prisma.tag.updateMany({
    data: {
      synced: false,
    },
  });
};

const deleteUnsyncedTags = async () => {
  await prisma.tag.deleteMany({
    where: {
      synced: false,
    },
  });
};

const syncTags = async (tags: AirtableTag[]) => {
  try {
    await unsyncAllTags();
    for (const tag of tags) {
      const record: object | null = await prisma.tag.findUnique({
        where: { id: tag.id },
      });
      if (!record) {
        await prisma.tag.create({
          data: { id: tag.id, name: tag.fields.name, synced: true },
        });
      } else {
        await prisma.tag.update({
          where: { id: tag.id },
          data: {
            name: tag.fields.name,
            synced: true,
          },
        });
      }
    }
    await deleteUnsyncedTags();
    return;
  } catch (error) {
    console.error(error);
    throw new Error("Couldn't sync tags");
  }
};

const syncTagsWithAirtable = async (req: Request, res: Response) => {
  try {
    //TODO Implement skipping empty fields and fields where not all criteria are present
    const tags: AirtableTag[] = await fetchTagsFromAirtable();
    await syncTags(tags);
    return res.status(200).send({ message: "Tags successfully synced" });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ message: "Couldn't Sync Tags" });
  }
};

const getTag = async (req: Request, res: Response) => {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: req.params.id },
      include: { tools: true },
    });
    logger.info(tag);
    return res.status(200).send({ tag });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .send({ message: "Something went wrong while trying to get this tag" });
  }
};

const getAllTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        tools: true,
      },
    });
    return res.status(200).send({ tags });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ message: "Couldn't get all tags" });
  }
};

export { syncTags, syncTagsWithAirtable, getTag, getAllTags };
