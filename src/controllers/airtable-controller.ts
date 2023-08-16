import { Request, Response } from "express";
import logger from "../logger";
import {
  AirtableCategory,
  AirtableTag,
  AirtableTool,
} from "../models/airtable_models";
import { syncTags } from "./tag-controller";
import { syncTools } from "./tool-controller";
import { syncCategories } from "./category-controller";

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
    throw new Error("Failed to get data from Airtable");
  }
};

const fetchToolsFromAirtable = async (): Promise<AirtableTool[]> => {
  try {
    const response = await fetch(
      `${process.env.AIRTABLE_URL}/${process.env.AIRTABLE_TOOL_TABLE_ID}`,
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
    throw new Error("Failed to get data from Airtable");
  }
};

const fetchCategoriesFromAirtable = async (): Promise<AirtableCategory[]> => {
  try {
    const response = await fetch(
      `${process.env.AIRTABLE_URL}/${process.env.AIRTABLE_CATEGORY_TABLE_ID}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        },
      }
    );
    const result = JSON.parse(await response.text());
    console.log(result.records);
    return result.records;
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to get data from Airtable");
  }
};

const syncTagsAndToolsWithAirtable = async (req: Request, res: Response) => {
  try {
    const tags: AirtableTag[] = await fetchTagsFromAirtable();
    await syncTags(tags);
    const categories: AirtableCategory[] = await fetchCategoriesFromAirtable();
    await syncCategories(categories);
    const tools: AirtableTool[] = await fetchToolsFromAirtable();
    const incompleteTool = await syncTools(tools);

    return res.status(200).send({
      message: "Successfully synced tags and tools with airtable",
      incompleteTool: incompleteTool,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      message:
        "Something went wrong while trying to sync tools and tags with airtable data",
    });
  }
};

export {
  fetchTagsFromAirtable,
  fetchToolsFromAirtable,
  fetchCategoriesFromAirtable,
  syncTagsAndToolsWithAirtable,
};
