interface AirtableToolFields {
  tags?: string[];
  approval: boolean;
  link: string;
  price: number;
  title: string;
  priceModel: string;
  description?: string;
}

interface AirtableTool {
  id: string;
  createdTime: string;
  fields: AirtableToolFields;
}

interface AirtableTag {
  id: string;
  createdTime: string;
  fields: AirtableTagFields;
}

interface AirtableTagFields {
  name: string;
}

interface AirtableCategory {
  id: string;
  createdTime: string;
  fields: AirtableCategoryFields;
}
interface AirtableCategoryFields {
  name: string;
}

export {
  AirtableTool,
  AirtableToolFields,
  AirtableTag,
  AirtableTagFields,
  AirtableCategory,
  AirtableCategoryFields,
};
