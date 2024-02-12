import { Request, Response } from 'express';
import { Listing } from '../../models/listing';
import { ImageService } from '../../services';
import { Upload } from '../../models/upload';
import { NotFoundError } from '../../errors/not-found-error';
import { BadRequestError } from '../../errors/bad-request-error';
import mongoose from 'mongoose';

const IMAGES = 'images';
const TYPE = 'listing';

export const getListings = async (req: Request, res: Response) => {
  const { page } = req.query;
  const p = page as any as number;
  const pageSize = 9;
  let startIndex = (p - 1) * pageSize;
  let endIndex = p * pageSize;
  const listings = await Listing.find({}).populate(IMAGES);
  const totalListings = listings.length;
  const paginatedListings = listings.slice(startIndex, endIndex);
  const totalPage = Math.ceil(listings.length / pageSize);
  res.send({
    properties: paginatedListings,
    totalPage,
    totalListings,
  });
};

export const setImageUrl = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { url } = req.body;
  const listing = await Listing.findById(id);
  if (!listing) throw new NotFoundError();
  listing.imageUrl = url;
  await listing.save();
  res.status(201).send(listing);
};

export const find = async (req: Request, res: Response) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate(IMAGES);
  res.send(listing);
};

export const create = async (req: Request, res: Response) => {
  const {
    description,
    type,
    address,
    country,
    state,
    price,
    status,
    featured,
    title,
    category,
    landmarks,
    accessories,
    coordinate,
    code,
    currency,
    contractor
  } = req.body;
  const listing = Listing.generate({
    currency,
    title,
    description,
    type,
    category,
    address,
    country,
    state,
    price,
    status,
    featured,
    landmarks,
    accessories,
    coordinate,
    code,
    contractor
  });
  await listing.save();
  res.status(201).send(listing);
};
export const updateFeaturedStatus = async (req: Request, res: Response) => {
  const id = req.params.id;
  const listing = await Listing.findById(id);
  if (!listing) throw new NotFoundError();
  listing.featured = !listing.featured;
  await listing.save();
  res.status(201).send(listing);
};

export const update = async (req: Request, res: Response) => {
  const {
    title,
    description,
    type,
    category,
    address,
    country,
    state,
    price,
    status,
    featured,
    landmarks,
    accessories,
    coordinate,
    code,
    currency,
    contractor
  } = req.body;
  const { id } = req.params;
  const listing = await Listing.findOneAndUpdate(
    { _id: id },
    {
      title,
      description,
      type,
      category,
      address,
      country,
      state,
      price,
      status,
      featured,
      landmarks,
      accessories,
      coordinate,
      code,
      currency,
      contractor
    },
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

export const uploadResource = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const file = req.file;
    if (file === undefined) throw new BadRequestError('Images are required');
    const utype: string = file.mimetype.split('/')[0];
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
    const listing = await Listing.findById(id);
    if (!listing) throw new NotFoundError();
    const response = await ImageService.resourceUpload(
      dataURI,
      id,
      TYPE,
      utype
    );
    let url = response.url;
    const urlSplit = url.split('http://');
    const notSecure = url.split('http://').length > 1;
    if (notSecure) {
      const newUrl = 'https://' + urlSplit[1];
      url = newUrl;
    }
    const upload = Upload.generate({
      url,
      asset_id: response.asset_id,
      public_id: response.public_id,
      resource_type: utype,
    });
    await upload.save();
    if (!upload) throw new Error('Upload not created');

    listing.images = [...listing.images, upload._id];
    await listing.save();
    await session.commitTransaction();
    session.endSession();
    res.status(201).send(listing);
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  const { id, public_id } = req.body;
  const upload = await Upload.findById(id);
  if (upload) {
    await ImageService.deleteImage(public_id);
    await Upload.deleteOne({ _id: upload._id });
  }
  res.status(201).send({});
};
