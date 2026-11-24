import mongoose, { type HydratedDocument } from "mongoose";
import { GenderEnum, ProvidersEnum, RoleEnum } from "../../common/types/enum";
import { IUser } from "../../common/types/interfaces.types";
import SecurityService from './../../common/Services/security.service';


const securityService = new SecurityService();
export type UserDocument = HydratedDocument<IUser, { fullName: string }>;

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      minlength: [3, "First name must be at least 3 characters long"],
      maxlength: [50, "First name must be at most 50 characters long"],
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      minlength: [3, "Last name must be at least 3 characters long"],
      maxlength: [50, "Last name must be at most 50 characters long"],
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: { name: "email_index_unique", unique: true },
    },
    password: { type: String, required: true },
    gender: {
      type: String,
      enum: GenderEnum,
      default: GenderEnum.MALE,
    },
    age: {
      type: Number,
      min: [16, "Age must be at least 16"],
      max: [60, "Age must be at most 60"],
    },
    profilePicture: String,
    coverPictures: [String],
    phoneNumber: String,
    role: {
      type: String,
      enum: RoleEnum,
      default: RoleEnum.USER,
    },
    googleSub: {
      type: String,
      index: { name: "idx_google_sub_unique", unique: true, sparse: true },
    },
    provider: {
      type: String,
      enum: ProvidersEnum,
      default: ProvidersEnum.SYSTEM,
    },
    isEmailVerified: { type: Boolean, default: false },
    isTwoStepEnabled: { type: Boolean, default: false },
    isPrivate: {
  type: Boolean,
  default: false,
},
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
  
);

userSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstName} __ ${this.lastName}`;
});

userSchema.pre('save', async function () {
    const isPasswordModified = this.isModified('password')
    const isPhoneNumberModified = this.isModified('phoneNumber')

    if (isPasswordModified) this.password = await securityService.hash(this.password)
      if (isPhoneNumberModified && this.phoneNumber)
        this.phoneNumber = securityService.encrypt(this.phoneNumber)
})


userSchema.post(['findOne', 'find'], function (result) {
    if(result){
      if (Array.isArray(result)) {
        result.forEach((doc) => {
            if (doc.phoneNumber) {
                doc.phoneNumber = securityService.decrypt(doc.phoneNumber)
            }
        })
    } else {
        if (result.phoneNumber) {
            result.phoneNumber = securityService.decrypt(result.phoneNumber)
        }
    }
    }
})


const User = mongoose.model<IUser>("User", userSchema);

export default User;
