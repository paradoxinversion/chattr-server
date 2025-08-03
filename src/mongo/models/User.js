import mongoose from "mongoose";
import bcrypt from "bcrypt";
// const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
/***
 * ROLES:
 * 0 - User
 * 1 - Mod
 * 2 - Admin
 *
 * ACCOUNT STATUSES:
 * 0 - Normal
 * 1 - Muted (Cannot send messages, can view chat)
 * 2 - Banned (Cannot Enter Chat)
 * 4 - Awaiting Activation
 */
const UserSchema = new Schema({
  username: String,
  password: {
    type: String,
    set: (ptPassword) => bcrypt.hashSync(ptPassword, 10),
  },
  role: String,
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  blockedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  accountStatus: String,
  profilePhotoURL: String,
  activated: { type: Boolean, default: false },
});

UserSchema.methods.checkPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
