import prisma from "../db";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import { AirtableTool } from "../models/airtable_models";
import { MetaData, getMetaDataForUrl } from "../helpers/scraping";
dotenv.config();

const unsyncTools = async () => {
  try {
    await prisma.tool.updateMany({ data: { synced: false } });
    return;
  } catch (error) {
    throw new Error("Sync Failed");
  }
};

const cleanupUnsyncedTools = async () => {
  await prisma.tool.deleteMany({
    where: {
      synced: false,
    },
  });
};

const getAirtableData = async (): Promise<AirtableTool[]> => {
  try {
    const response = await fetch(process.env.AIRTABLE_URL || "", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      },
    });
    const result = JSON.parse(await response.text());
    return result.records;
  } catch (error) {
    throw new Error("Failed to get data from Airtable");
  }
};

const syncAirtable = async (req: Request, res: Response) => {
  try {
    await unsyncTools();
    const tools: AirtableTool[] = await getAirtableData();
    for (const tool of tools) {
      const meta: MetaData = await getMetaDataForUrl(tool.fields.link);
      const record: object | null = await prisma.tool.findUnique({
        where: {
          url: tool.fields.link,
        },
      });
      if (record == null) {
        await prisma.tool.create({
          data: {
            url: tool.fields.link,
            name: tool.fields.title,
            description:
              tool.fields.description || meta.description || "No description",
            price: tool.fields.price,
            priceModel: tool.fields.priceModel,
            approval: tool.fields.approval,
            tags: {
              connect: [{ id: 1 }],
            },
            creator: {
              connect: {
                id: 1,
              },
            },
            image: meta.image,
            icon: meta.icon,
            synced: true,
          },
        });
      } else {
        await prisma.tool.update({
          where: { url: tool.fields.link },
          data: {
            url: tool.fields.link,
            name: tool.fields.title,
            price: tool.fields.price,
            priceModel: tool.fields.priceModel,
            approval: tool.fields.approval,
            tags: {
              connect: [
                {
                  id: 1,
                },
              ],
            },
            synced: true,
          },
        });
      }
    }
    //TODO Implement rescraping if this is passed in query
    await cleanupUnsyncedTools();
    return res.status(200).send({ message: "Synced Successfully" });
  } catch (error) {
    console.error(error);
    throw new Error("Couldn't Sync Airtable Data with Database");
  }
};

const getSingleToolById = async (req: Request, res: Response) => {
  try {
    const tool = await prisma.tool.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    return res.status(200).send(tool);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Something went wrong " });
  }
};

const getToolsByQuery = async (req: Request, res: Response) => {
  try {
    // const tag = req.query.tag;
    const type = req.query;
    const tags = ["video", "text", "image"];
    const result = await prisma.tool.findMany({
      where: {
        tags: {
          some: {
            OR: tags.map((tag) => ({ name: tag })),
          },
        },
      },
    });
    return res.status(200).send({ result });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Couldn't fulfill query" });
  }
};

export { syncAirtable, getSingleToolById, getToolsByQuery };
