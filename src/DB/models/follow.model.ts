import mongoose from "mongoose";
import {  IFollow } from "../../common/types/interfaces.types";
import { FollowStatusEnum } from "../../common/types/enum";

const followSchema = new mongoose.Schema<IFollow>(
  {
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    followingId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(FollowStatusEnum),
      default: FollowStatusEnum.ACCEPTED,
    },
  },
  { timestamps: true },
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow = mongoose.model<IFollow>("Follow", followSchema);
export default Follow;