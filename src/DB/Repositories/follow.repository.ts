import type { Types } from "mongoose";
import BaseRepository from "./base.repository";
import { IFollow } from "../../common/types/interfaces.types";
import Follow from "../models/follow.model";
import { FollowStatusEnum } from "../../common/types/enum";

export default class FollowRepository extends BaseRepository<IFollow> {
  constructor() {
    super(Follow);
  }

  removeFollow(followerId: Types.ObjectId, followingId: Types.ObjectId) {
    return this.model.findOneAndDelete({ followerId, followingId });
  }

  listPendingRequests(userId: Types.ObjectId) {
    return this.model
      .find({ followingId: userId, status: FollowStatusEnum.PENDING })
      .populate("followerId", "firstName lastName profilePicture")
      .sort({ createdAt: -1 });
  }

  listFollowers(userId: Types.ObjectId) {
    return this.model
      .find({ followingId: userId, status: FollowStatusEnum.ACCEPTED })
      .populate("followerId", "firstName lastName profilePicture");
  }

  listFollowing(userId: Types.ObjectId) {
    return this.model
      .find({ followerId: userId, status: FollowStatusEnum.ACCEPTED })
      .populate("followingId", "firstName lastName profilePicture");
  }

  acceptAllPending(userId: Types.ObjectId) {
    return this.model.updateMany(
      { followingId: userId, status: FollowStatusEnum.PENDING },
      { status: FollowStatusEnum.ACCEPTED },
    );
  }



  suggestByMutual(me: Types.ObjectId, myFollowingIds: Types.ObjectId[], excludeIds: Types.ObjectId[], limit: number) {
  return this.model.aggregate<{ _id: Types.ObjectId; mutual: number }>([
    {
      $match: {
        followerId: { $in: myFollowingIds },
        status: FollowStatusEnum.ACCEPTED,
        followingId: { $nin: [...excludeIds, me] },
      },
    },
    { $group: { _id: "$followingId", mutual: { $sum: 1 } } },
    { $sort: { mutual: -1 } },
    { $limit: limit },
  ]);
}

}