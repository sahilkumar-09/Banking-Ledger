import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required for creating a user"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      unique: [true, "Email already exists"],
    },
    name: {
      type: String,
      required: [true, "Name is required for creating an account"],
    },
    password: {
      type: String,
      required: [true, "Password is required for creating an account"],
      minlength: [8, "Password should be contain more than 8 character"],
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function(){
  try {
    if (!this.isModified("password")) {
      return
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    return
  } catch (error) {
    next(error)
  }
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const users = mongoose.model("user", userSchema);
export default users;
