import prisma from "../db";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import { AirtableTool } from "../models/airtable_models";
import { MetaData, getMetaDataForUrl } from "../helpers/scraping";
import {
  convertOrderQueryToOrderObject,
  convertQueryToList,
} from "../helpers/conversion";
import logger from "../logger";
import { fetchToolsFromAirtable } from "./airtable-controller";
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

const syncTools = async (tools: AirtableTool[]) => {
  try {
    await unsyncTools();
    for (const tool of tools) {
      const meta: MetaData = await getMetaDataForUrl(tool.fields.link);
      const record: object | null = await prisma.tool.findUnique({
        where: {
          url: tool.fields.link,
        },
      });
      if (record == null) {
        //TODO Implement skipping empty fields and fields where not all criteria are present
        await prisma.tool.create({
          data: {
            id: tool.id,
            url: tool.fields.link,
            name: tool.fields.title,
            description:
              tool.fields.description || meta.description || "No description",
            price: tool.fields.price,
            priceModel: tool.fields.priceModel,
            approval: tool.fields.approval,
            tags: {
              connect: tool.fields.tags?.map((id) => ({ id: id })),
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
              connect: tool.fields.tags?.map((id) => ({ id: id })),
            },
            synced: true,
          },
        });
      }
    }
    await cleanupUnsyncedTools();
    return;
  } catch (error) {
    console.error(error);
    throw new Error("Couldn't sync tools");
  }
};

const syncToolsWithAirtable = async (req: Request, res: Response) => {
  try {
    const tools: AirtableTool[] = await fetchToolsFromAirtable();
    await syncTools(tools);
    //TODO Implement rescraping if this is passed in query
    return res.status(200).send({ message: "Synced Successfully" });
  } catch (error) {
    logger.error(error);
    throw new Error("Couldn't Sync Airtable Data with Database");
  }
};

const getSingleToolById = async (req: Request, res: Response) => {
  try {
    const tool = await prisma.tool.findUnique({
      where: { id: req.params.id },
    });
    return res.status(200).send(tool);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ message: "Something went wrong " });
  }
};

const getToolsByQuery = async (req: Request, res: Response) => {
  try {
    const tags = convertQueryToList(req.query.tag);
    console.log(tags);
    const order: string | undefined = req.query.sort as string | undefined;

    let some: object = {};
    if (tags.length != 0) {
      some = { OR: tags.map((tag) => ({ name: tag })) };
    }

    const orderBy = convertOrderQueryToOrderObject(order);

    const result = await prisma.tool.findMany({
      where: {
        tags: {
          ...(some && { some: some }),
        },
      },
      orderBy,
    });

    return res.status(200).send({ result });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ message: "Couldn't fulfill query" });
  }
};

const deleteSingleToolById = async (req: Request, res: Response) => {
  try {
    await prisma.tool
      .delete({
        where: { id: req.params.id },
      })
      .catch((error) => {
        if (error.code == "P2025")
          return res
            .status(404)
            .send({ message: "Can't find tool to be deleted" });
      });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ message: "Couldn't delete tool" });
  }
};

const updateSingleToolById = async (req: Request, res: Response) => {
  try {
    return res.status(200).send({ message: "Updated tool successfully" });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ message: "Couldn't update tool" });
  }
};

export {
  syncTools,
  syncToolsWithAirtable,
  getSingleToolById,
  getToolsByQuery,
  deleteSingleToolById,
  updateSingleToolById,
};
