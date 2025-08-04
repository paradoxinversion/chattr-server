import jdenticon from "jdenticon";
const createUser = (clientId, user) => {
  return {
    username: user.username,
    avatar: jdenticon.toPng(user.username, 150),
    id: clientId,
    socketId: clientId,
    iid: user.iid,
    userId: user.userId,
    blockList: user.blockList.map(user => user._id.toString()),
    blockedBy: user.blockedBy.map(user => user._id.toString()),
    role: user.role,
    accountStatus: user.accountStatus,
    profilePhotoURL: user.profilePhotoURL
  };
};

export default createUser;