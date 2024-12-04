import mongoose from "mongoose";

const { Schema } = mongoose;

const replySchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 500,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: { createdAt: true } }
);

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1500,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    replies: [replySchema],
  },
  { timestamps: { createdAt: true } }
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for product"],
    },
    price: {
      type: String,
      required: [true, "Set price for product"],
    },
    description: {
      type: String,
      required: [true, "Set description for product"],
    },
    condition: {
      type: String,
      required: [true, "Set condition for product"],
    },
    PLZ: {
      type: String,
      required: [true, "Set postal code for product"],
    },
    city: {
      type: String,
      required: [true, "Set city for product"],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    image1: {
      type: String,
      required: [true, "Set the first image for product"],
    },
    image2: String,
    image3: String,
    image4: String,
    category: {
      type: String,
      required: [true, "Set category for product"],
    },
    subcategories: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one subcategory is required",
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "vip", "archive"],
      default: "pending",
    },
    comments: [commentSchema],
  },
  { versionKey: false, timestamps: { createdAt: true } }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
