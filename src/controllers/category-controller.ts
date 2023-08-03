import prisma from "../db";
import { AirtableCategory } from "../models/airtable_models";

const unsyncAllCategories = async () => {
  await prisma.category.updateMany({
    data: { synced: false },
  });
};

const deleteUnsyncedCategories = async () => {
  await prisma.category.deleteMany({
    where: { synced: false },
  });
};

const syncCategories = async (categories: AirtableCategory[]) => {
  try {
    await unsyncAllCategories();
    for (const category of categories) {
      const record: object | null = await prisma.category.findUnique({
        where: { id: category.id },
      });
      if (!record) {
        await prisma.category.create({
          data: {
            id: category.id,
            name: category.fields.name,
            synced: true,
          },
        });
      } else {
        await prisma.category.update({
          where: { id: category.id },
          data: {
            name: category.fields.name,
            synced: true,
          },
        });
      }
    }
    await deleteUnsyncedCategories();
    return;
  } catch (error) {
    console.error(error);
    throw new Error("Couldn't sync categories");
  }
};

export { syncCategories };
