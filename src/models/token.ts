import mongoose from 'mongoose';

export interface Properties {
  token: string;
  user: mongoose.Schema.Types.ObjectId;
}

interface TokenModel extends mongoose.Model<TokenDoc> {
  generate(attrs: Properties): TokenDoc;
}
interface TokenDoc extends mongoose.Document {
  token: string;
  user: mongoose.Schema.Types.ObjectId;
  expires: Date;
  created_at: Date;
  updated_at: Date;
}

const tokenSchema = new mongoose.Schema<TokenDoc>(
  {
    token: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expires: {
      type: Date,
      default: new Date(new Date().getTime() + 1 * 86400000), //expired in 24hrs
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
      generate(attrs: Properties): TokenDoc {
        return new Token(attrs);
      },
    },
  }
);

tokenSchema.pre('save', async function (done) {
  if (this.isModified()) {
    this.set('updated_at', Date.now());
  }
  done();
});

const Token = mongoose.model<TokenDoc, TokenModel>('Token', tokenSchema);

export { Token };
