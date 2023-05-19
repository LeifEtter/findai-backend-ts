import prisma from "../db";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import { AirtableTool } from "../models/airtable_models";
import { MetaData, getMetaDataForUrl } from "../helpers/scraping";
import {
  convertOrderQueryToOrderObject,
  convertQueryToList,
} from "../helpers/conversion";
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
    const tags = convertQueryToList(req.query.tag);
    const order: string | undefined = req.query.sort as string | undefined;

    let some: object = {};
    if (tags.length != 0) {
      some = { OR: tags.map((tag) => ({ name: tag })) };
    }

    const orderBy = convertOrderQueryToOrderObject(order);

    const result = await prisma.tool.findMany({
      where: {
        tags: {
          some,
        },
      },
      orderBy,
    });

    return res.status(200).send({ result });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Couldn't fulfill query" });
  }
};

const deleteSingleToolById = async (req: Request, res: Response) => {
  try {
    await prisma.tool
      .delete({
        where: { id: parseInt(req.params.id) },
      })
      .catch((error) => {
        if (error.code == "P2025")
          return res
            .status(404)
            .send({ message: "Can't find tool to be deleted" });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Couldn't delete tool" });
  }
};

const updateSingleToolById = async (req: Request, res: Response) => {
  try {
    return res.status(200).send({ message: "Updated tool successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Couldn't update tool" });
  }
};

export {
  syncAirtable,
  getSingleToolById,
  getToolsByQuery,
  deleteSingleToolById,
  updateSingleToolById,
};
