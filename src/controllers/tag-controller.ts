import { Request, Response } from "express";

const createTag = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
  } catch (error) {
    console.error(error);
  }
};

export { createTag };
