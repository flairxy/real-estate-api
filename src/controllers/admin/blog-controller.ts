import { Request, Response } from 'express';
import { Blog } from '../../models/blog';
import { ImageService } from '../../services';
import { Upload } from '../../models/upload';
import { NotFoundError } from '../../errors/not-found-error';
import { BadRequestError } from '../../errors/bad-request-error';
import mongoose from 'mongoose';

const COVER_IMAGE = 'cover_image';
const TYPE = 'blog';

export const getBlogs = async (req: Request, res: Response) => {
  const { page } = req.query;
  const p = page as any as number;
  const pageSize = 9;
  let startIndex = (p - 1) * pageSize;
  let endIndex = p * pageSize;
  const blogs = await Blog.find({}).populate(COVER_IMAGE);
  const totalBlogs = blogs.length;
  const paginatedBlogs = blogs.slice(startIndex, endIndex);
  const totalPage = Math.ceil(blogs.length / pageSize);
  res.send({
    properties: paginatedBlogs,
    totalPage,
    totalBlogs,
  });
};

export const find = async (req: Request, res: Response) => {
  const { id } = req.params;
  const blog = await Blog.findById(id).populate(COVER_IMAGE);
  res.send(blog);
};

export const create = async (req: Request, res: Response) => {
  const { title, body } = req.body;
  const blog = Blog.generate({
    title,
    body,
  });
  await blog.save();
  res.status(201).send(blog);
};

export const update = async (req: Request, res: Response) => {
  const { title, body } = req.body;
  const { id } = req.params;
  const blog = await Blog.findOneAndUpdate(
    { _id: id },
    {
      title,
      body,
    },
    {
      new: true,
    }
  );
  res.status(201).send(blog);
};
export const deleteBlog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (blog) {
    const uploadId = blog.cover_image;
    let publicId: string = '';
    const upload = await Upload.findById(uploadId);
    if (upload) publicId = upload.public_id;
      await ImageService.deleteUploads([publicId], id, TYPE);
      await Upload.deleteOne({ _id: uploadId });
    
    await Blog.deleteOne({ _id: id });
  }
  res.status(201).send({});
};

export const filter = async (req: Request, res: Response) => {
  const text = req.body.text;
  const blog = await Blog.find({
    $or: [{ title: { $lte: text } }],
  });

  res.send(blog);
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
    const blog = await Blog.findById(id);
    if (!blog) throw new NotFoundError();
    const response = await ImageService.resourceUpload(
      dataURI,
      id,
      TYPE,
      utype
    );
    const upload = Upload.generate({
      url: response.url,
      asset_id: response.asset_id,
      public_id: response.public_id,
      resource_type: utype,
    });
    await upload.save();
    if (!upload) throw new Error('Upload not created');

    blog.cover_image = upload._id;
    await blog.save();
    await session.commitTransaction();
    session.endSession();
    res.status(201).send(blog);
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
