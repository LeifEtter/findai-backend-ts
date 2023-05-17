import prisma from "../db";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
// import { Response as FetchResponse } from "node-fetch";
dotenv.config();

const unsyncTools = async () => {
  try {
    await prisma.tool.updateMany({ data: { synced: false } });
    return;
  } catch (error) {
    throw new Error("Sync Failed");
  }
};

const getAirtableData = async (): Promise<object[]> => {
  try {
    // TODO Add type to fetch result
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

    const tools: object[] = await getAirtableData();
    for (const tool of tools) {
      console.log(tool);
      // await prisma.tool.create({
      //   data: {
      //     url: tool.link,
      //     name: tool.title,
      //     description: tool.description,
      //   },
      // });
    }

    return res.status(200).send({ message: "Synced Successfully" });
  } catch (error) {
    throw new Error("Couldn't Sync Airtable Data with Database");
  }
};

export { syncAirtable };
