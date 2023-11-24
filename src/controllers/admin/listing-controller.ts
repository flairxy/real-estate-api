import { Request, Response } from 'express';
import { Listing } from '../../models/listing';
import { ImageService } from '../../services';
import { Upload } from '../../models/upload';
import { NotFoundError } from '../../errors/not-found-error';
import { BadRequestError } from '../../errors/bad-request-error';

const IMAGES = 'images';
const TYPE = 'listing';

export const getListings = async (req: Request, res: Response) => {
  const listings = await Listing.find({}).populate(IMAGES);
  res.send(listings);
};

export const find = async (req: Request, res: Response) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate(IMAGES);
  res.send(listing);
};

export const create = async (req: Request, res: Response) => {
  const { description, type, location, price, available, featured } = req.body;
  const listing = Listing.generate({
    description,
    type,
    location,
    price,
    available,
    featured,
  });
  await listing.save();
  res.status(201).send(listing);
};
export const update = async (req: Request, res: Response) => {
  const { description, type, location, price, available, featured } = req.body;
  const { id } = req.params;
  const listing = await Listing.findOneAndUpdate(
    { _id: id },
    { description, type, location, price, available, featured },
    {
      new: true,
    }
  );
  res.status(201).send(listing);
};
export const deleteListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const list = await Listing.findById(id);
  if (list) {
    const uploadIds = list.images; //ids of uploads
    const publicIds: string[] = [];
    for (let count = 0; count < uploadIds.length; count++) {
      const upload = await Upload.findById(uploadIds[count]);
      if (upload) publicIds.push(upload.public_id);
    }
    if (publicIds.length > 0) {
      await ImageService.deleteUploads(publicIds, id, TYPE);
      await Upload.deleteMany({ _id: uploadIds });
    }
    await Listing.deleteOne({ _id: id });
  }
  res.status(201).send({});
};

export const filter = async (req: Request, res: Response) => {
  const location = req.body.location;
  let price = req.body.price;
  let listing = null;
  if (isNaN(price) || price <= 0) {
    price = 1000000000000000;
  }

  if (location.trim().length === 0) {
    listing = await Listing.find({
      $or: [{ price: { $lte: price } }],
    });
  } else
    listing = await Listing.find({
      $or: [{ price: { $lte: price } }],
      location,
    }).populate(IMAGES);
  res.send(listing);
};

export const uploadImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const image = req.file;
  if (image === undefined) throw new BadRequestError('Images are required');
  const b64 = Buffer.from(image.buffer).toString('base64');
  const dataURI = 'data:' + image.mimetype + ';base64,' + b64;
  const listing = await Listing.findById(id);
  if (!listing) throw new NotFoundError();
  const response = await ImageService.imageUpload(dataURI, id, TYPE);
  const upload = Upload.generate({
    url: response.url,
    asset_id: response.asset_id,
    public_id: response.public_id,
  });
  await upload.save();

  listing.images = [...listing.images, ...upload._id];
  listing.save();
  res.status(201).send(listing);
};
