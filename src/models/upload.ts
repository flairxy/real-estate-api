import mongoose from 'mongoose';

interface Properties {
  url: string;
  asset_id: string;
  public_id: string;
}

interface UploadModel extends mongoose.Model<UploadDoc> {
  generate(attrs: Properties): UploadDoc;
}

//An interface that describes the properties that a user document has
interface UploadDoc extends mongoose.Document {
  url: string;
  asset_id: string;
  public_id: string;
}

const uploadSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    asset_id: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now(),
    },
    updated_at: {
      type: Date,
      default: Date.now(),
    }
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
      generate(attrs: Properties): UploadDoc {
        return new Upload(attrs);
      },
    },
  }
);

uploadSchema.pre('save', async function (done) {
  if (this.isModified()) {
    this.set('updated_at', Date.now());
  }
  done();
});

const Upload = mongoose.model<UploadDoc, UploadModel>(
  'Upload',
  uploadSchema
);

export { Upload };
