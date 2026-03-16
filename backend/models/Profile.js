const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 13,
      max: 120,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.index({ email: 1 });
profileSchema.index({ fullName: 1 });

module.exports = mongoose.model("Profile", profileSchema);

