import mongoose from "mongoose";

const connectToDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log("MongoDb is connected successfully");
  } catch (error) {
    console.log("MongoDb connection error", error.message);
  }
};

export default connectToDb;