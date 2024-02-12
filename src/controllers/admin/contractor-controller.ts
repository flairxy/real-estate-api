import { Request, Response } from 'express';
import { Contractor } from '../../models/contractor';

export const getContractors = async (req: Request, res: Response) => {
  const contractors = await Contractor.find({});
  res.send(contractors);
};

export const create = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const contractor = Contractor.generate({
    name,
    description
  });
  await contractor.save();
  res.status(201).send(contractor);
};

export const update = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const { id } = req.params;
  const contractor = await Contractor.findOneAndUpdate(
    { _id: id },
    {
      name, description
    },
    {
      new: true,
    }
  );
  res.status(201).send(contractor);
};
export const deleteContractor = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Contractor.deleteOne({ _id: id });
  res.status(201).send({});
};

