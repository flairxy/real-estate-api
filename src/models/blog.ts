import mongoose from 'mongoose';

export interface Properties {
  title: string;
  body: string;
  cover_image?: mongoose.Schema.Types.ObjectId;
}

//An interface that describes the properties that a user model has
interface BlogModel extends mongoose.Model<BlogDoc> {
  generate(attrs: Properties): BlogDoc;
}

//An interface that describes the properties that a user document has
interface BlogDoc extends mongoose.Document {
  title: string;
  body: string;
  cover_image: mongoose.Schema.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const blogSchema = new mongoose.Schema<BlogDoc>(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    cover_image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upload',
    },
    created_at: {
      type: Date,
      default: Date.now(),
    },
    updated_at: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    //here we're defining how our response will look like.
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    statics: {
      generate(attrs: Properties): BlogDoc {
        return new Blog(attrs);
      },
    },
  }
);

blogSchema.pre('save', async function (done) {
  if (this.isModified()) {
    this.set('updated_at', Date.now());
  }
  done();
});

const Blog = mongoose.model<BlogDoc, BlogModel>(
  'Blog',
  blogSchema
);

export { Blog };
