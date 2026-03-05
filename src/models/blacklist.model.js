import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, "Token is required to blacklist"],
    unique: [true, "Token is already blacklisted"],
  }
},{timestamps: true});

tokenBlacklistSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 60*60*24*3 
})

const tokenBlacklists = mongoose.model("tokenBlacklist", tokenBlacklistSchema);
export default tokenBlacklists;