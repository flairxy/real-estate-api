import mongoose from 'mongoose';
import { TransactionStatus } from '../utils/constants';

export interface Properties {
  list: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  amount: number;
  reference: string;
  code: string;
  status?: TransactionStatus;
}

//An interface that describes the properties that a user model has
interface TransactionModel extends mongoose.Model<TransactionDoc> {
  generate(attrs: Properties): TransactionDoc;
}

//An interface that describes the properties that a user document has
interface TransactionDoc extends mongoose.Document {
  list: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  amount: number;
  status: TransactionStatus;
  reference: string;
  code: string;
  txId: string;
  isDeleted: boolean;
  created_at: Date;
  updated_at: Date;
}

const transactionSchema = new mongoose.Schema<TransactionDoc>(
  {
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      enum: [TransactionStatus.PENDING, TransactionStatus.COMPLETED],
      default: TransactionStatus.PENDING
    },
    reference: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    txId: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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
        delete ret.isDeleted;
      },
    },
    statics: {
      generate(attrs: Properties): TransactionDoc {
        return new Transaction(attrs);
      },
    },
  }
);

transactionSchema.pre('save', async function (done) {
  if (this.isModified()) {
    this.set('updated_at', Date.now());
  }
  done();
});

transactionSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

transactionSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

const Transaction = mongoose.model<TransactionDoc, TransactionModel>(
  'Transaction',
  transactionSchema
);

export { Transaction };
