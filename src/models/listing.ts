import mongoose from 'mongoose';
import { ListingStatus } from '../utils/constants';

export interface Accessories {
  interior: string[];
  other: string[];
  outdoor: string[];
  utilities: string[];
}

export interface Coodinate {
  lat: number;
  lng: number;
}

export interface Landmark {
  type: number;
  distance: string;
}

export interface Properties {
  title: string;
  description: string;
  images?: mongoose.Schema.Types.ObjectId[];
  type: number;
  category: string;
  code: string;
  address: string;
  country: string;
  state: string;
  price: number;
  landmarks?: mongoose.Schema.Types.Mixed[];
  accessories?: Accessories;
  coordinate?: Coodinate;
  status?: ListingStatus;
  featured?: boolean;
  locked?: boolean;
  locked_at?: Date;
  locked_by?: mongoose.Schema.Types.ObjectId;
}

//An interface that describes the properties that a user model has
interface ListingModel extends mongoose.Model<ListingDoc> {
  generate(attrs: Properties): ListingDoc;
}

//An interface that describes the properties that a user document has
interface ListingDoc extends mongoose.Document {
  title: string;
  description: string;
  images: mongoose.Schema.Types.ObjectId[];
  type: number;
  category: string;
  address: string;
  country: string;
  state: string;
  code: string;
  price: number;
  landmarks: mongoose.Schema.Types.Mixed[];
  accessories: Accessories;
  coordinate: Coodinate;
  status: ListingStatus;
  featured: boolean;
  locked: boolean;
  locked_by: mongoose.Schema.Types.ObjectId;
  locked_at: Date;
  created_at: Date;
  updated_at: Date;
}

const listingSchema = new mongoose.Schema<ListingDoc>(
  {
    title: {
      type: String,
      required: true,
    },
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
    code: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    accessories: {
      type: mongoose.Schema.Types.Mixed,
    },
    coordinate: {
      type: mongoose.Schema.Types.Mixed,
    },
    landmarks: {
      type: [mongoose.Schema.Types.Mixed],
    },
    price: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: ListingStatus.PENDING,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    locked_at: {
      type: Date,
      default: Date.now(),
    },
    locked_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
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
        ret.videos = ret.images.filter((img: any) => img.resource_type === 'video');
        ret.images = ret.images.filter((img: any) => img.resource_type === 'image');
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
