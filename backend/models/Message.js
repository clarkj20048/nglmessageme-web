const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    profileId: {
      type: String,
      required: true,
    },
    anonymousName: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ profileId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);

