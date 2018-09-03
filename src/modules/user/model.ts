import { Schema, model, Document } from 'mongoose';

export interface UserI extends Document {
  _id: string;
  fname: string;
  lname: string;
  phone?: string;
  email: string;
  password: string;
  capability: string;
}

const membership = new Schema({
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
  },
  isOwner: Boolean,
});

const user = new Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: 'Please supply an email address',
    },
    lodge: {
      type: String,
    },
    belongsTo: [membership],
    password: { type: String, select: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

user.virtual('name').get(function() {
  return `${this.fname} ${this.lname}`;
});

export default model<UserI>('User', user);
