module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      chapter: Number,
      topic: Number,
      item: Number,
      fullId: String,
      description: String,
      unit: String,
      price: Number,
    },
    { timestamps: true }
  );

  const Binarit = mongoose.model("binarit", schema);
  return Binarit;
};