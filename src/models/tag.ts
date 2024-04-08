import mongoose from 'mongoose';

export interface Properties {
  name: string;
}

//An interface that describes the properties that a user model has
interface TagModel extends mongoose.Model<TagDoc> {
  generate(attrs: Properties): TagDoc;
}

//An interface that describes the properties that a user document has
interface TagDoc extends mongoose.Document {
  name: string;
  created_at: Date;
  updated_at: Date;
}

const tagSchema = new mongoose.Schema<TagDoc>(
  {
    name: {
      type: String,
      required: true
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
      generate(attrs: Properties): TagDoc {
        return new Tag(attrs);
      },
    },
  }
);

tagSchema.pre('save', async function (done) {
  if (this.isModified()) {
    this.set('updated_at', Date.now());
  }
  done();
});

const Tag = mongoose.model<TagDoc, TagModel>(
  'Tag',
  tagSchema
);

export { Tag };
