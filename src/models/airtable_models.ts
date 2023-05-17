interface AirtableToolFields {
  tags: string[];
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

export { AirtableTool, AirtableToolFields };
