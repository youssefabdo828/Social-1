import {Router} from "express";
import userService from './user.service' 
import { multerUpload } from "../../Middlewares/multer.middleware";
import { BadRequestException } from "../../common/Utils/Errors/exception.error";
import { authenticate } from "../../Middlewares/authentication.middleware";
import { IAuth } from "../../common/types/interfaces.types";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./user.validation";
import { Types } from "mongoose";



const userController = Router();

userController.get("/health", (req, res) => {

  res.json({ message: "User service is healthy" });
});


userController.patch('/upload-profile', authenticate, multerUpload.single('profile'), async (req, res) => {
    const user = (req as IAuth).authUser
    if (!req.file) throw new BadRequestException('Please upload a file', null, 'UPLOAD_NEEDED')

    const result = await userService.uploadProfilePicture(req.file as Express.Multer.File, user)
    res.json({ message: 'Uploaded success', result });
})

userController.delete("/delete", async (req, res) => {
    const { key } = req.body
    if (!key) throw new BadRequestException('Please provide the file key', null, 'KEY_NEEDED')
    const result = await userService.deleteFileService(key)
    res.json({ message: 'Deleted success', result 
      
    });

userController.delete("/delete-many", async (req, res) => {
    const { keys } = req.body
    if (!Array.isArray(keys) || keys.length === 0) {
        throw new BadRequestException('Please provide an array of file keys', null, 'KEYS_NEEDED')
    }
    const result = await userService.deleteFilesService(keys)
    res.json({ message: 'Deleted success', result });
})


userController.get('/list', async (req, res) => {
    const result = await userService.listAllusers()
    res.json({ message: 'Users Fetched successfully', result });
})




userController.get("/profile", authenticate, async (req, res) => {
  const result = await userService.getProfile(req.authUser._id as Types.ObjectId);
  res.status(200).json({ message: "Profile retrieved successfully", data: result });
});

userController.patch(
  "/profile",
  authenticate,
  validation(validators.updateProfile),
  async (req, res) => {
    const result = await userService.updateProfile(
      req.authUser._id as Types.ObjectId,
      req.validate.body,
    );
    res.status(200).json({ message: "Profile updated successfully", data: result });
  },
);




userController.patch(
  "/settings/privacy",
  authenticate,
  validation(validators.updatePrivacy),
  async (req, res) => {
    const result = await userService.updatePrivacy(
      req.authUser._id as Types.ObjectId,
      req.validate.body,
    );
    res.status(200).json({ message: "Privacy updated successfully", data: result });
  },
);





userController.post(
  "/follow",
  authenticate,
  validation(validators.followUser),
  async (req, res) => {
    const result = await userService.followUser(
      req.authUser._id as Types.ObjectId,
      req.validate.body.userId,
    );
    res.status(200).json({ message: "Follow request processed", data: result });
  },
);

userController.delete(
  "/follow",
  authenticate,
  validation(validators.followUser),
  async (req, res) => {
    await userService.unfollowUser(
      req.authUser._id as Types.ObjectId,
      req.validate.body.userId,
    );
    res.status(200).json({ message: "Unfollowed successfully" });
  },
);

userController.get("/follow-requests", authenticate, async (req, res) => {
  const result = await userService.getFollowRequests(req.authUser._id as Types.ObjectId);
  res.status(200).json({ message: "Follow requests retrieved", data: result });
});

userController.patch(
  "/follow-requests",
  authenticate,
  validation(validators.respondToFollowRequest),
  async (req, res) => {
    const { followerId, action } = req.validate.body;
    const result = await userService.respondToFollowRequest(
      req.authUser._id as Types.ObjectId,
      followerId,
      action,
    );
    res.status(200).json({ message: "Follow request updated", data: result });
  },
);

userController.get(
  "/followers",
  authenticate,
  validation(validators.listConnections),
  async (req, res) => {
    const result = await userService.getFollowers(
      req.authUser._id as Types.ObjectId,
      req.validate.query.userId,
    );
    res.status(200).json({ message: "Followers retrieved", data: result });
  },
);

userController.get(
  "/following",
  authenticate,
  validation(validators.listConnections),
  async (req, res) => {
    const result = await userService.getFollowing(
      req.authUser._id as Types.ObjectId,
      req.validate.query.userId,
    );
    res.status(200).json({ message: "Following retrieved", data: result });
  },
);




userController.get(
  "/search",
  authenticate,
  validation(validators.searchUsers),
  async (req, res) => {
    const result = await userService.searchUsers(
      req.authUser._id as Types.ObjectId,
      req.validate.query,
    );
    res.status(200).json({ message: "Users retrieved successfully", data: result });
  },
);

userController.get(
  "/suggestions",
  authenticate,
  validation(validators.suggestions),
  async (req, res) => {
    const result = await userService.getSuggestions(
      req.authUser._id as Types.ObjectId,
      req.validate.query.limit,
    );
    res.status(200).json({ message: "Suggestions retrieved successfully", data: result });
  },
);

})

export default userController;