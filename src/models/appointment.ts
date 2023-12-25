import mongoose from 'mongoose';
import { AppontmentStatus } from '../utils/constants';

export interface Properties {
  description: string;
  list: mongoose.Schema.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
}

//An interface that describes the properties that a user model has
interface AppointmentModel extends mongoose.Model<AppointmentDoc> {
  generate(attrs: Properties): AppointmentDoc;
}

//An interface that describes the properties that a user document has
interface AppointmentDoc extends mongoose.Document {
  description: string;
  list: mongoose.Schema.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  status?: boolean;
  created_at: Date;
  updated_at: Date;
}

const appointmentSchema = new mongoose.Schema<AppointmentDoc>(
  {
    description: {
      type: String,
      required: false,
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing'
    },
    name: {
      type: String,
      required: true
    },
    email: { type: String, required: true},
    phone: { type: String, required: true},
    status: {
      type: Number,
      enum: [AppontmentStatus.PENDING, AppontmentStatus.COMPLETED],
      default: AppontmentStatus.PENDING,
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
      generate(attrs: Properties): AppointmentDoc {
        return new Appointment(attrs);
      },
    },
  }
);

appointmentSchema.pre('save', async function (done) {
  if (this.isModified()) {
    this.set('updated_at', Date.now());
  }
  done();
});

const Appointment = mongoose.model<AppointmentDoc, AppointmentModel>(
  'Appointment',
  appointmentSchema
);

export { Appointment };
