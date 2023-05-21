import { Request, Response } from "express";
import * as dotenv from "dotenv";
import { AirtableTag } from "../models/airtable_models";
import prisma from "../db";
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
    console.error(error);
    throw new Error();
  }
};

const syncTags = async (req: Request, res: Response) => {
  try {
    //TODO Implement skipping empty fields and fields where not all criteria are present
    const tags: AirtableTag[] = await fetchTagsFromAirtable();
    for (const tag of tags) {
      const record: object | null = await prisma.tag.findUnique({
        where: { id: tag.id },
      });
      console.log(tags);
      if (!record) {
        await prisma.tag.create({
          data: { id: tag.id, name: tag.fields.name },
        });
      } else {
        await prisma.tag.update({
          where: { id: tag.id },
          data: {
            name: tag.fields.name,
          },
        });
      }
    }
    return res.status(200).send({ message: "Tags successfully synced" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Couldn't Sync Tags" });
  }
};

const createTag = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
  } catch (error) {
    console.error(error);
  }
};

export { syncTags, createTag };
