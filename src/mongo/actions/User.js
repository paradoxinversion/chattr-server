import User from "../models/User.js";
import bcrypt from "bcrypt";

/**
 * Creates a new user with the provided name and password,
 * defaulting to a basic role unless one is provided.
 * @param {*} param0
 * @returns The new user object
 */
const createUser = async ({ username, password, role = 0 }) => {
  const user = await User.findOne({ username });
  if (user) {
    // User exists
    const error = new Error("user exists");
    throw error;
  }

  /**
   * ROLES:
   * 0 - User
   * 1 - Mod
   * 2 - Admin
   *
   * ACCOUNT STATUSES:
   * 0 - Normal
   * 1 - Muted (Cannot send messages, can view chat)
   * 2 - Banned (Cannot Enter Chat)
   */

  const newUser = new User({
    username,
    password,
    role,
    blockedUsers: [],
    blockedBy: [],
    accountStatus: 0,
    profilePhotoUrl: "",
  });
  await newUser.save();
  return newUser;
};

/**
 * Adds the blocked user the the blocking user's blocklist.
 * Also adds the blocking user to the blocked users blockedBy list.
 * @param {*} blockingUserId - The id of the user initiating the block
 * @param {*} blockedUserId - The id of the user being blocked
 * @returns An object containing two arrays: the users the blocking user has blocked,
 * and the users the blocked user has been blocked by
 */
const addUserToBlockList = async (blockingUserId, blockedUserId) => {
  if (!blockedUserId || !blockedUserId) {
    const err = new Error(
      "Blocking or blocked user is missing from addUserToBlockList parameters."
    );
    throw err;
  }
  const blockingUser = await User.findById(blockingUserId);
  if (!blockingUser.blockedUsers.includes(blockedUserId)) {
    const blockedUser = await User.findById(blockedUserId);
    blockingUser.blockedUsers.push(blockedUserId);
    blockedUser.blockedBy.push(blockingUserId);
    await blockingUser.save();
    await blockedUser.save();

    return {
      blocked: blockingUser.blockedUsers,
      blockedBy: blockedUser.blockedBy,
    };
  } else {
    return {
      blocked: blockingUser.blockedUsers,
      blockedBy: blockedUser.blockedBy,
    };
  }
};

/**
 * Remove a user from another's blocklisdt
 * @param {*} unblockingUserId
 * @param {*} unblockedUserId
 * @returns An object containing two arrays: the users the blocking user has blocked,
 * and the users the blocked user has been blocked by
 */
const removeUserFromBlockList = async (unblockingUserId, unblockedUserId) => {
  const unblockingUser = await User.findById(unblockingUserId);
  if (unblockingUser.blockedUsers.includes(unblockedUserId)) {
    const unblockedUser = await User.findById(unblockedUserId);
    unblockingUser.blockedUsers.splice(
      unblockingUser.blockedUsers.indexOf(unblockedUserId),
      1
    );
    unblockedUser.blockedBy.splice(
      unblockedUser.blockedBy.indexOf(unblockingUserId),
      1
    );
    await unblockingUser.save();
    await unblockedUser.save();
    return {
      result: 1,
      blocked: unblockingUser.blockedUsers,
      blockedBy: unblockedUser.blockedBy,
    };
  } else {
    return {
      result: 0,
      blocked: unblockingUser.blockedUsers,
      blockedBy: unblockedUser.blockedBy,
    };
  }
};

/**
 * Retrieves a user from the Database by Username
 * @param {*} username
 * @returns The user object
 */
const readUser = async (username) => {
  const user = await User.findOne({ username });
  if (!user) {
    const error = new Error("Cannot find that user");
    throw error;
  }

  return user;
};

/**
 * Sets a user's account status to baend (2), and returns that user
 * @param {*} userId
 */
const banUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("Cannot find that user");
    throw error;
  }

  user.accountStatus = 2;
  await user.save();
  return user;
};

/**
 * Updates a user's password.
 * @param {*} user
 * @param {*} password
 * @returns A object with a truthy result
 */
const updatePassword = async (user, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();
  return { result: 1 };
};

/**
 * Updates a user's username
 * @param {*} user
 * @param {*} newUsername
 *  @returns A object with a truthy result
 */
const updateUsername = async (user, newUsername) => {
  user.username = newUsername;
  await user.save();
  return { result: 1 };
};

/**
 * Sets a user's profile photo url
 * @param {*} user - User db object
 * @param {*} photoURL
 * @returns A object with a truthy result and the set url
 */
const setUserPhoto = async (user, photoURL) => {
  user.profilePhotoURL = photoURL;
  await user.save();
  return { result: 1, url: user.profilePhotoURL };
};

/**
 * Sets a user's account status
 * @param {*} userId
 * @param {*} status
 * @returns The user who's status has changed
 */
const setAccountStatus = async (userId, status) => {
  if (!status) {
    const error = new Error(
      "No status included in setAccountStatus parameters."
    );
    throw error;
  }
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("Cannot find that user");
    throw error;
  }

  user.accountStatus = status;
  await user.save();
  return user;
};

/**
 * Gets banned users
 * @returns An array of objects cotaining the id's and userames of banned users
 */
const getBannedUsers = async () => {
  const users = await User.find({ accountStatus: 2 }).select("id username");
  return users;
};

/**
 * Gets users not yet activated
 * @returns An array of objects cotaining the id's and userames of unactivated users
 */
const getUnactivatedUsers = async () => {
  const users = await User.find({ activated: false }).select("username id");
  return users;
};

/**
 * Gets all users
 * @returns An array of objects cotaining the id's and userames of all users
 */
const getUsers = async () => {
  return await User.find({}).select("id username");
};

/**
 * Activates a user in the database.
 * @param {*} userId
 * @returns a object with the result of the activation
 */
const activateUser = async (userId) => {
  const user = await User.findById(userId);
  user.activated = true;
  await user.save();
  return { result: "User Activated" };
};

/**
 * Delete a user from the database by ID.
 * @param {*} userId
 */
const deleteUser = async (userId) => {
  //! Deletion in regards to blocking/blocked users needs to addressed
  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (deletedUser) {
      return {
        result: `${deletedUser.username} has been deleted from the database`,
      };
    } else {
      const error = new Error("No User Found");
      throw error;
    }
  } catch (e) {
    throw e;
  }
};

/**
 * Return a username by the userId that matches it.
 * @param {*} userId
 */
const getUsernameFromId = async (userId) => {
  return await User.findById(userId).select("username").lean();
};
export default {
  createUser,
  readUser,
  addUserToBlockList,
  removeUserFromBlockList,
  banUser,
  setAccountStatus,
  getBannedUsers,
  updatePassword,
  setUserPhoto,
  updateUsername,
  getUnactivatedUsers,
  activateUser,
  getUsers,
  deleteUser,
  getUsernameFromId,
};
