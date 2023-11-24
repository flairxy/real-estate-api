import mongoose from 'mongoose';

export interface Properties {
  description: string;
  images?: mongoose.Schema.Types.ObjectId[];
  type: number;
  location: string;
  price: number;
  available?: boolean;
  featured?: boolean;
}

//An interface that describes the properties that a user model has
interface ListingModel extends mongoose.Model<ListingDoc> {
  generate(attrs: Properties): ListingDoc;
}

//An interface that describes the properties that a user document has
interface ListingDoc extends mongoose.Document {
  description: string;
  images: mongoose.Schema.Types.ObjectId[];
  type: number;
  location: string;
  price: number;
  available: boolean;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}

const listingSchema = new mongoose.Schema<ListingDoc>(
  {
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Upload',
        },
      ],
      required: true,
    },
    type: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: true,
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
      generate(attrs: Properties): ListingDoc {
        return new Listing(attrs);
      },
    },
  }
);

listingSchema.pre('save', async function (done) {
  if (this.isModified()) {
    this.set('updated_at', Date.now());
  }
  done();
});

const Listing = mongoose.model<ListingDoc, ListingModel>(
  'Listing',
  listingSchema
);

export { Listing };
