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
  location: {
    PLZ: {
      type: String,
      required: [true, 'Set postal code for product'],
    },
    city: {
      type: String,
      required: [true, 'Set city for product'],
    },
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  gallery: {
    image1: String,
    image2: String,
    image3: String,
  },
  views: {
    type: String,
    required: [true, 'Set views for product'],
  },
  category: {
    subcategory1: String,
    subcategory2: String,
    subcategory3: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { versionKey: false });

const Product = mongoose.model('Product', productSchema);

export default Product;
