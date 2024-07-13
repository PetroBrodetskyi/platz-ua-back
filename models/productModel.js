import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Set name for product'],
  },
  price: {
    type: String,
    required: [true, 'Set price for product'],
  },
  description: {
    type: String,
    required: [true, 'Set description for product'],
  },
  condition: {
    type: String,
    required: [true, 'Set condition for product'],
  },
  PLZ: {
    type: String,
    required: [true, 'Set postal code for product'],
  },
  city: {
    type: String,
    required: [true, 'Set city for product'],
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  image1: {
    type: String,
    required: [true, 'Set the first image for product'],
  },
  image2: String,
  image3: String,
  image4: String,
  views: String,
  category: {
    type: String,
    required: [true, 'Set category for product'],
  },
  subcategory1: {
    type: String,
    required: [true, 'Set first subcategory for product'],
  },
  subcategory2: String,
  subcategory3: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { versionKey: false, timestamps: { createdAt: true } });

const Product = mongoose.model('Product', productSchema);

export default Product;
