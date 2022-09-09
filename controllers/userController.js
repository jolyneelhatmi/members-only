const User = require('../models/user');
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');



// Display list of all Users.
exports.user_list = (req, res) => {
  User.find()
    .sort([['username', 'ascending']])
    .exec(function (err, list_users) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('user_list', { title: 'User List', user_list: list_users });
    });
};

// Display detail page for a specific User.
exports.user_detail = (req, res) => {
  res.send(`User id: ${req.params.id}`);
};
/*exports.log_in_get = (req, res) => {
  res.render("login_in");
};*/

exports.sign_up_get = (req, res) => {
  res.render("sign_up_form", { title: "Sign up" });
};

/*exports.log_in_post = passport.authenticate('local', { 
  successRedirect:'/', failureRedirect: '/catalog/login-in'
})*/
// Handle User Sign-up on POST.
exports.log_out_get = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}
exports.sign_up_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("username must be specified."),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("password must be specified."),
  body("confirmPassword")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("doesn't match the password."),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("sign_up_form", {
        title: "Sign up",
        user: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if(err) console.log(err);
      else{
        let member;
        req.body.passcode === '123456' ? member = "member":member="user";
        if(req.body.admincode === 'admin')  member = "admin";
        const user = new User({
          first_name: req.body.first_name,
          family_name: req.body.family_name,
          username: req.body.username,
          password: hashedPassword,
          membership: member,
        }).save(err =>{
          if(err){
            return next(err);
          }
        });
        res.redirect('/catalog');
      }
    });
  },
];

