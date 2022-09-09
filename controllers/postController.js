const Post = require('../models/post');
const User = require('../models/user');
const async = require('async');
const { body, validationResult } = require("express-validator");

exports.index = (req, res) =>{
  Post.find({}, 'title author text edited')
    .sort({title : 1})
    .populate('author')
    .exec(function (err, list_posts) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('index', { title: 'Post List', post_list: list_posts , user:req.user });
    });
};


// Display post create form on GET.
exports.post_create_get = (req, res, next) => {
  res.render("post_form", {
    title1: "Write something",
  });
};

// Handle post create on POST.
exports.post_create_post = [

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("text", "text field must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Post object with escaped and trimmed data.
    const post = new Post({
      title: req.body.title,
      author: req.user,
      text: req.body.text,
      edited:"false",
    });
    if (!errors.isEmpty()) {
        const fail =(err, results) => {
          if (err) {
            return next(err);
          }
          res.render("post_form", {
            title1: "Write something",
            title: results.title,
            text: results.text,
            post,
            errors: errors.array(),
          });
        }
      
      return;
    }

    // Data from form is valid. Save book.
    post.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect route.
      res.redirect('/catalog');
    });
  },
];

// Display post delete form on GET.
exports.post_delete_get = (req, res, next) => {
  async.parallel(
    {
      post(callback) {
        Post.findById(req.params.id).populate("author").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.post == null) {
        // No results.
        res.redirect("/catalog/");
      }
      // Successful, so render.
      res.render("post_delete", {
        title: "Delete Post",
        post: results.post,
      });
    }
  );
};


// Handle post delete on POST.
exports.post_delete_post = (req, res, next) => {
  Post.findByIdAndRemove(req.params.id, function deletePost(err) {
    if (err) { return next(err); }
    res.redirect('/catalog/');
    });
};


exports.post_update_get = function(req, res, next) {

  Post.findById(req.params.id, function(err, post) {
      if (err) { return next(err); }
      if (post==null) { // No results.
          var err = new Error('Post not found');
          err.status = 404;
          return next(err);
      }
      // Success.
      res.render('post_form', { title: 'Update Post', post: post });
  });
};

exports.post_update_post = [
   
  // Validate and sanitze the name field.
  body('title', 'Title must be specified').trim().isLength({ min: 3 }).escape(),
  body('text', 'text is empty must').trim().isLength({ min: 1 }).escape(),
  

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request .
      const errors = validationResult(req);

  // Create a genre object with escaped and trimmed data (and the old id!)
      var post = new Post(
        {
        title: req.body.title,
        text:req.body.text,
        author:req.user,
        edited: 'true',
        _id: req.params.id
        }
      );


      if (!errors.isEmpty()) {
          // There are errors. Render the form again with sanitized values and error messages.
          res.render('post_form', { title: 'Update Post', post: post, errors: errors.array()});
      return;
      }
      else {
          // Data from form is valid. Update the record.
          Post.findByIdAndUpdate(req.params.id, post, {}, function (err) {
              if (err) { return next(err); }
                 // Successful - redirect to genre detail page.
                 res.redirect('/');
              });
      }
  }
];