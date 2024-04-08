import { Request, Response } from 'express';
import { Tag } from '../../models/tag';

export const getTags = async (req: Request, res: Response) => {
  const tags = await Tag.find({});
  res.send(tags);
};

export const create = async (req: Request, res: Response) => {
  const { name } = req.body;
  const tag = Tag.generate({
    name,
  });
  await tag.save();
  res.status(201).send(tag);
};

export const update = async (req: Request, res: Response) => {
  const { name } = req.body;
  const { id } = req.params;
  const tag = await Tag.findOneAndUpdate(
    { _id: id },
    {
      name,
    },
    {
      new: true,
    }
  );
  res.status(201).send(tag);
};
export const deleteTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Tag.deleteOne({ _id: id });
  res.status(201).send({});
};
