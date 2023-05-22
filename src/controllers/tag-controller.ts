import { Request, Response } from "express";
import * as dotenv from "dotenv";
import { AirtableTag } from "../models/airtable_models";
import prisma from "../db";
import logger from "../logger";
dotenv.config();

const fetchTagsFromAirtable = async (): Promise<AirtableTag[]> => {
  try {
    const response = await fetch(
      `${process.env.AIRTABLE_URL}/${process.env.AIRTABLE_TAG_TABLE_ID}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        },
      }
    );
    const result = JSON.parse(await response.text());
    return result.records;
  } catch (error) {
    logger.error(error);
    throw new Error();
  }
};

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

const syncTags = async (req: Request, res: Response) => {
  try {
    await unsyncAllTags();
    //TODO Implement skipping empty fields and fields where not all criteria are present
    const tags: AirtableTag[] = await fetchTagsFromAirtable();

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

export { syncTags, getTag };
