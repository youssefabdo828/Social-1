import FileService from "../../common/Services/file.service"
import { IUser } from "../../common/types/interfaces.types"
import { NotFoundException } from "../../common/Utils/Errors/exception.error"
import UserRepository from "../../DB/Repositories/user.repository"
import { Types } from "mongoose";
import { UpdatePrivacyBody, UpdateProfileBody } from "./user.dto";
import FollowRepository from "../../DB/Repositories/follow.repository";

import {
  BadRequestException,
  ConflictException,
} from "../../common/Utils/Errors/exception.error";
import { FollowStatusEnum } from "../../common/types/enum";

class UserService {
    private fileService = new FileService()
    private userRepo = new UserRepository()
    private followRepo = new FollowRepository();

 async   uploadProfilePicture(file: Express.Multer.File, user:IUser) {
     const {url , key } = await this.fileService.uploadFile(file, 'Profiles')


     await this.userRepo.updateDocumentById({ _id: user._id, updateData: { profilePicture: key }, options: { new: true } })
     return {url ,key}
    }

    deleteFileService(key: string) {
         return this.fileService.deleteFile(key)
    }
    
    deleteFilesService(keys: string[]) {
        return this.fileService.deleteFiles(keys)
    }


listAllusers(){
    return this.userRepo.findAllDocument()
}



async getProfile(userId: Types.ObjectId) {
  const user = await this.userRepo.findDocumentById({ _id: userId });
  if (!user) {
    throw new NotFoundException("User not found", null, "USER_NOT_FOUND");
  }

  const { password, ...profile } = user.toObject();


  let profilePictureUrl: string | undefined;
  if (profile.profilePicture) {
    const { url } = await this.fileService.getSignedUrl(profile.profilePicture);
    profilePictureUrl = url;
  }

  return { ...profile, profilePictureUrl };
}

async updateProfile(userId: Types.ObjectId, body: UpdateProfileBody) {
  const user = await this.userRepo.findDocumentById({ _id: userId });
  if (!user) {
    throw new NotFoundException("User not found", null, "USER_NOT_FOUND");
  }

  const { firstName, lastName, gender, age, phoneNumber } = body;
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (gender !== undefined) user.gender = gender;
  if (age !== undefined) user.age = age;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;


  await user.save();

  const { password, ...profile } = user.toObject();
  return profile;
}

async updatePrivacy(userId: Types.ObjectId, { isPrivate }: UpdatePrivacyBody) {
  const updated = await this.userRepo.updateDocumentById({
    _id: userId,
    updateData: { isPrivate },
    options: { new: true },
  });
  if (!updated) {
    throw new NotFoundException("User not found", null, "USER_NOT_FOUND");
  }

  if (!isPrivate) {
    await this.followRepo.acceptAllPending(userId);
  }

  return { isPrivate: updated.isPrivate };
}




async followUser(me: Types.ObjectId, targetId: string) {
  const target = new Types.ObjectId(targetId);

  if (me.equals(target)) {
    throw new BadRequestException("You cannot follow yourself", null, "SELF_FOLLOW");
  }

  const targetUser = await this.userRepo.findDocumentById({ _id: target });
  if (!targetUser) {
    throw new NotFoundException("User not found", null, "USER_NOT_FOUND");
  }

  const existing = await this.followRepo.findOneDocument({
    followerId: me,
    followingId: target,
  });
  if (existing) {
    throw new ConflictException(
      existing.status === FollowStatusEnum.ACCEPTED
        ? "You already follow this user"
        : "Follow request already sent",
      null,
      "ALREADY_FOLLOWING",
    );
  }

  const status = targetUser.isPrivate
    ? FollowStatusEnum.PENDING
    : FollowStatusEnum.ACCEPTED;

  await this.followRepo.createNewDocument({
    followerId: me,
    followingId: target,
    status,
  });

  return { status };
}

async unfollowUser(me: Types.ObjectId, targetId: string) {
  const removed = await this.followRepo.removeFollow(me, new Types.ObjectId(targetId));
  if (!removed) {
    throw new NotFoundException("You are not following this user", null, "NOT_FOLLOWING");
  }
  return true;
}

async getFollowRequests(me: Types.ObjectId) {
  return this.followRepo.listPendingRequests(me);
}

async respondToFollowRequest(
  me: Types.ObjectId,
  followerId: string,
  action: "accept" | "reject",
) {
  const request = await this.followRepo.findOneDocument({
    followerId: new Types.ObjectId(followerId),
    followingId: me,
    status: FollowStatusEnum.PENDING,
  });
  if (!request) {
    throw new NotFoundException("Follow request not found", null, "REQUEST_NOT_FOUND");
  }

  if (action === "accept") {
    request.status = FollowStatusEnum.ACCEPTED;
    await request.save();
    return { status: FollowStatusEnum.ACCEPTED };
  }

  await request.deleteOne();
  return { status: "rejected" };
}

private async assertCanViewConnections(me: Types.ObjectId, target: Types.ObjectId) {
  if (me.equals(target)) return;

  const targetUser = await this.userRepo.findDocumentById({ _id: target });
  if (!targetUser) {
    throw new NotFoundException("User not found", null, "USER_NOT_FOUND");
  }
  if (!targetUser.isPrivate) return;

  const isFollowing = await this.followRepo.findOneDocument({
    followerId: me,
    followingId: target,
    status: FollowStatusEnum.ACCEPTED,
  });
  if (!isFollowing) {
    throw new BadRequestException("This account is private", null, "PRIVATE_ACCOUNT");
  }
}

async getFollowers(me: Types.ObjectId, userId?: string) {
  const target = userId ? new Types.ObjectId(userId) : me;
  await this.assertCanViewConnections(me, target);
  return this.followRepo.listFollowers(target);
}

async getFollowing(me: Types.ObjectId, userId?: string) {
  const target = userId ? new Types.ObjectId(userId) : me;
  await this.assertCanViewConnections(me, target);
  return this.followRepo.listFollowing(target);
}




private escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async searchUsers(
  me: Types.ObjectId,
  { q, page, limit }: { q: string; page: number; limit: number },
) {
  const terms = q.split(/\s+/).map((t) => this.escapeRegex(t));


  const filters = {
    _id: { $ne: me },
    $and: terms.map((term) => ({
      $or: [
        { firstName: { $regex: term, $options: "i" } },
        { lastName: { $regex: term, $options: "i" } },
      ],
    })),
  };

  const users = await this.userRepo.findAllDocument(filters, {
    select: "firstName lastName profilePicture isPrivate",
    sort: { firstName: 1 },
    skip: (page - 1) * limit,
    limit,
  });


  const follows = await this.followRepo.findAllDocument({
    followerId: me,
    followingId: { $in: users.map((u) => u._id) },
  });
  const statusByUser = new Map(follows.map((f) => [f.followingId.toString(), f.status]));

  return users.map((u) => ({
    ...u.toObject(),
    followStatus: statusByUser.get(u._id.toString()) ?? "none",
  }));
}

async getSuggestions(me: Types.ObjectId, limit: number) {

  const myFollows = await this.followRepo.findAllDocument({ followerId: me });
  const excludeIds = myFollows.map((f) => f.followingId);
  const acceptedIds = myFollows
    .filter((f) => f.status === FollowStatusEnum.ACCEPTED)
    .map((f) => f.followingId);


  const mutual = acceptedIds.length
    ? await this.followRepo.suggestByMutual(me, acceptedIds, excludeIds, limit)
    : [];
  const mutualIds = mutual.map((m) => m._id);

  const mutualUsers = mutualIds.length
    ? await this.userRepo.findAllDocument(
        { _id: { $in: mutualIds } },
        { select: "firstName lastName profilePicture isPrivate" },
      )
    : [];
  const mutualMap = new Map(mutual.map((m) => [m._id.toString(), m.mutual]));

  const fromMutual = mutualUsers
    .map((u) => ({ ...u.toObject(), mutualFollowers: mutualMap.get(u._id.toString()) ?? 0 }))
    .sort((a, b) => b.mutualFollowers - a.mutualFollowers);


  let fillers: typeof fromMutual = [];
  const remaining = limit - fromMutual.length;
  if (remaining > 0) {
    const others = await this.userRepo.findAllDocument(
      { _id: { $nin: [me, ...excludeIds, ...mutualIds] } },
      {
        select: "firstName lastName profilePicture isPrivate",
        sort: { createdAt: -1 },
        limit: remaining,
      },
    );
    fillers = others.map((u) => ({ ...u.toObject(), mutualFollowers: 0 }));
  }

  return [...fromMutual, ...fillers];
}



}

export default new UserService()