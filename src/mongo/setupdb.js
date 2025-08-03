import mongoose from "mongoose";

const setup =  async () => {
  await mongoose.connect(
    `mongodb://mongo:27017/chatter}`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));

  return { db, mongoose };
};

export default setup;
