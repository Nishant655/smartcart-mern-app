import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Please enter product title"], 
      trim: true 
    },
    description: { 
      type: String, 
      default: "" 
    },
    price: { 
      type: Number, 
      required: [true, "Please enter product price"], 
      min: 0 
    },
    category: { 
      type: String, 
      index: true, 
      default: "general" 
    },
    image: { 
      type: String 
    },
    stock: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
  },
  { timestamps: true }
);

// 🔍 Indexes for search & performance
productSchema.index({ title: "text", description: "text", category: 1 });
productSchema.index({ price: 1, createdAt: -1 });

export default mongoose.model("Product", productSchema);
