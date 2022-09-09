const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    edited: {type: String, required: true},
    //timestamp: new Date(),
  }
);

// Virtual for book's URL
PostSchema
  .virtual('url')
  .get(function() { // We don't use an arrow function as we'll need the this object
    return '/catalog/post/' + this._id;
  });

//Export model
module.exports = mongoose.model('Post', PostSchema);