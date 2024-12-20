import mongoose from "mongoose";

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    phone: {
      type: String,
      required: [false, "Phone number is required"],
    },
    password: {
      type: String,
      required: [false, "Password is required"],
      minlength: 6,
    },
    email: {
      type: String,
      match: [emailRegexp, "Invalid email format"],
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business", "admin"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
      default: null,
    },
    avatarPublicId: {
      type: String,
      default: null,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [false, "Verify token is required"],
    },
    likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likes: {
      type: Number,
      default: 0,
    },
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    plz: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    facebook: {
      type: String,
      default: null,
    },
    instagram: {
      type: String,
      default: null,
    },
    linkedin: {
      type: String,
      default: null,
    },
    telegram: {
      type: String,
      default: null,
    },
    site: {
      type: String,
      default: null,
    },
    about: {
      type: String,
      default: null,
    },
    favoriteProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { versionKey: false, timestamps: { createdAt: true } }
);

const User = mongoose.model("User", userSchema);

export default User;
