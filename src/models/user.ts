import mongoose from 'mongoose';
import { PasswordManager } from '../services/password-manager';
import { Roles } from '../utils/constants';

//An interface that describes the properties required to create a new user
export interface UserAttrs {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
  role?: Roles;
}

//An interface that describes the properties that a user model has
export interface UserModel extends mongoose.Model<UserDoc> {
  generate(attrs: UserAttrs): UserDoc;
}

//An interface that describes the properties that a user document has
export interface UserDoc extends mongoose.Document {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
  role: Roles;
  is_verified: boolean;
  isDeleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}

const userSchema = new mongoose.Schema<UserDoc>(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      enum: [Roles.USER, Roles.ADMIN],
      default: Roles.USER,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    is_verified: {
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
        ret.type = ret.role;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
        delete ret.role;
        delete ret.isDeleted;
      },
    },
  }
);

userSchema.static('generate', function generate(attrs: UserAttrs) {
  return new User(attrs);
});

userSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

userSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

userSchema.pre('save', async function (done) {
  // we use the function keyword instead of the arrow function since we want our "this" to point to the user
  //using the arrow function will make "this" equal to the context of the entire file
  if (this.isModified('password')) {
    const hash = await PasswordManager.toHash(this.get('password')); //get the user's password and pass it to hash
    this.set('password', hash);
  }
  if (this.isModified()) {
    this.set('updated_at', Date.now());
  }
  done();
});

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
export { User };
