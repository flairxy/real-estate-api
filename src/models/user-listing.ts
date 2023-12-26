import mongoose from 'mongoose';

export interface Properties {
  listing: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  transaction: mongoose.Schema.Types.ObjectId;
}

interface UserListingModel extends mongoose.Model<UserListingDoc> {
  generate(attrs: Properties): UserListingDoc;
}
interface UserListingDoc extends mongoose.Document {
  listing: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  transaction: mongoose.Schema.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const userListingSchema = new mongoose.Schema<UserListingDoc>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
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
      generate(attrs: Properties): UserListingDoc {
        return new UserListing(attrs);
      },
    },
  }
);

userListingSchema.pre('save', async function (done) {
  if (this.isModified()) {
    this.set('updated_at', Date.now());
  }
  done();
});

const UserListing = mongoose.model<UserListingDoc, UserListingModel>('UserListing', userListingSchema);

export { UserListing };
