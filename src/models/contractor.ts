import mongoose from 'mongoose';

export interface Properties {
  name: string;
  description?: string;
}

//An interface that describes the properties that a user model has
interface ContractorModel extends mongoose.Model<ContractorDoc> {
  generate(attrs: Properties): ContractorDoc;
}

//An interface that describes the properties that a user document has
interface ContractorDoc extends mongoose.Document {
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

const contractorSchema = new mongoose.Schema<ContractorDoc>(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
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
      },
    },
    statics: {
      generate(attrs: Properties): ContractorDoc {
        return new Contractor(attrs);
      },
    },
  }
);

contractorSchema.pre('save', async function (done) {
  if (this.isModified()) {
    this.set('updated_at', Date.now());
  }
  done();
});

const Contractor = mongoose.model<ContractorDoc, ContractorModel>(
  'Contractor',
  contractorSchema
);

export { Contractor };
