import { z } from "zod";
import { GenderEnum } from "../../common/types/enum";

export const updateProfile = z.object({
  body: z
    .strictObject({
      firstName: z.string().min(3).max(50).optional(),
      lastName: z.string().min(3).max(50).optional(),
      gender: z.enum(GenderEnum).optional(),
      age: z.number().min(16).max(60).optional(),
      phoneNumber: z.string().min(10).max(15).optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      error: "Provide at least one field to update",
    }),
});



export const updatePrivacy = z.object({
  body: z.strictObject({
    isPrivate: z.boolean({ error: "isPrivate must be true or false" }),
  }),
});



const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id" });

export const followUser = z.object({
  body: z.strictObject({ userId: objectId }),
});

export const respondToFollowRequest = z.object({
  body: z.strictObject({
    followerId: objectId,
    action: z.enum(["accept", "reject"]),
  }),
});

export const listConnections = z.object({
  query: z.strictObject({ userId: objectId.optional() }),
});


export const searchUsers = z.object({
  query: z.strictObject({
    q: z.string().trim().min(1).max(50),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

export const suggestions = z.object({
  query: z.strictObject({
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});