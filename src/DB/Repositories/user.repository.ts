
import { IUser } from "../../common/types/interfaces.types";
import User from "../models/user.model";
import BaseRepository from "./base.repository";

export default class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  findUserByEmail(email: string) {
    return this.findOneDocument({ email });
  }
}