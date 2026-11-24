import { z } from "zod";
import { updateProfile, updatePrivacy } from "./user.validation";

export type UpdateProfileBody = z.infer<typeof updateProfile>["body"];

export type UpdatePrivacyBody = z.infer<typeof updatePrivacy>["body"];