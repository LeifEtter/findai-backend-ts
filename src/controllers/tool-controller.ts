import prisma from "../db";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import { AirtableTool } from "../models/airtable_models";
import { MetaData, getMetaDataForUrl } from "../helpers/scraping";
import {
  convertOrderQueryToOrderObject,
  convertQueryToList,
  alterRequestQueryToUseArrays,
} from "../helpers/conversion";
import logger from "../logger";
import { fetchToolsFromAirtable } from "./airtable-controller";
import { User } from "@prisma/client";
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
    const incompleteTool = [];
    for (const tool of tools) {
      //verify tool fields
      if (!tool.fields.link || !tool.fields.title) {
        incompleteTool.push({
          ...tool,
          message: "This tool is incomplete",
        });
      } else {
        const meta: MetaData = await getMetaDataForUrl(tool.fields.link);

        //upsert record
        await prisma.tool.upsert({
          where: {
            url: tool.fields.link,
          },
          create: {
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
            categories: {
              connect: tool.fields.categories?.map((id) => ({ id: id })),
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
          update: {
            url: tool.fields.link,
            name: tool.fields.title,
            price: tool.fields.price,
            priceModel: tool.fields.priceModel,
            approval: tool.fields.approval,
            tags: {
              connect: tool.fields.tags?.map((id) => ({ id: id })),
            },
            categories: {
              connect: tool.fields.categories?.map((id) => ({ id: id })),
            },
            synced: true,
          },
        });
      }

      // const record: object | null = await prisma.tool.findUnique({
      //   where: {
      //     url: tool.fields.link,
      //   },
      // });
      // if (record == null) {
      //   //TODO Implement skipping empty fields and fields where not all criteria are present
      //   await prisma.tool.create({
      //     data: {
      //       id: tool.id,
      //       url: tool.fields.link,
      //       name: tool.fields.title,
      //       description:
      //         tool.fields.description || meta.description || "No description",
      //       price: tool.fields.price,
      //       priceModel: tool.fields.priceModel,
      //       approval: tool.fields.approval,
      //       tags: {
      //         connect: tool.fields.tags?.map((id) => ({ id: id })),
      //       },
      //       creator: {
      //         connect: {
      //           id: 1,
      //         },
      //       },
      //       image: meta.image,
      //       icon: meta.icon,
      //       synced: true,
      //     },
      //   });
      // } else {
      //   await prisma.tool.update({
      //     where: { url: tool.fields.link },
      //     data: {
      //       url: tool.fields.link,
      //       name: tool.fields.title,
      //       price: tool.fields.price,
      //       priceModel: tool.fields.priceModel,
      //       approval: tool.fields.approval,
      //       tags: {
      //         connect: tool.fields.tags?.map((id) => ({ id: id })),
      //       },
      //       synced: true,
      //     },
      //   });
      // }
    }

    await cleanupUnsyncedTools();
    return incompleteTool;
  } catch (error) {
    console.error(error);
    throw new Error("Couldn't sync tools");
  }
};

const syncToolsWithAirtable = async (req: Request, res: Response) => {
  try {
    const tools: AirtableTool[] = await fetchToolsFromAirtable();
    const incompleteTool = await syncTools(tools);
    //TODO Implement rescraping if this is passed in query
    return res.status(200).send({
      message: "Successfully synced tools with airtable",
      incompleteTool,
    });
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

// const processQuery = (query: any) => {
//   if (query.tag == undefined || query.sort == undefined) {
//     throw new Error("Query is missing parameters such as tag or sort");
//   } else {
//     const params: object;

//     if()
//   }
// };

const getToolsByQuery = async (req: Request, res: Response) => {
  try {
    req.query = alterRequestQueryToUseArrays(req.query);

    const tagsResponse = convertQueryToList(req.query.tag);
    const categoriesResponse = convertQueryToList(req.query.category);

    const order: string | undefined = req.query.sort as string | undefined;
    let tags: object = {};
    if (tagsResponse && tagsResponse.length != 0) {
      tags = { OR: tagsResponse.map((tag) => ({ name: tag })) };
    }
    let categories: object = {};
    if (categoriesResponse && categoriesResponse.length != 0) {
      categories = {
        OR: categoriesResponse.map((category) => ({ name: category })),
      };
    }

    const orderBy = convertOrderQueryToOrderObject(order);

    const result = await prisma.tool.findMany({
      where: {
        tags: {
          ...(tags && { some: tags }),
        },
        categories: {
          ...(categories && { some: categories }),
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

const unbookmarkTool = async (req: Request, res: Response) => {
  try {
    const tool = await prisma.tool.findUnique({ where: { id: req.params.id } });
    if (!tool) {
      return res
        .status(400)
        .send({ message: "No tool with that id could be found" });
    }

    const user: User = res.locals.user;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        bookmarkedTools: {
          disconnect: {
            id: req.params.id,
          },
        },
      },
    });
    return res
      .status(201)
      .send({ message: "Tool successfully removed from bookmarks" });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .send({ message: "Something went wrong while trying to bookmark tool" });
  }
};

const bookmarkTool = async (req: Request, res: Response) => {
  try {
    const tool = await prisma.tool.findUnique({ where: { id: req.params.id } });
    if (!tool) {
      return res
        .status(400)
        .send({ message: "No tool with that id could be found" });
    }
    const user: User = res.locals.user;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        bookmarkedTools: {
          connect: {
            id: req.params.id,
          },
        },
      },
    });
    return res.status(201).send({ message: "Tool successfully bookmarked" });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .send({ message: "Something went wrong while trying to bookmark tool" });
  }
};

export {
  syncTools,
  syncToolsWithAirtable,
  getSingleToolById,
  getToolsByQuery,
  deleteSingleToolById,
  updateSingleToolById,
  bookmarkTool,
  unbookmarkTool,
};
