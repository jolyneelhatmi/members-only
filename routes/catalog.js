const express = require('express');
const router = express.Router();


const post_controller = require('../controllers/postController');
const user_controller = require('../controllers/userController');

router.get('/', post_controller.index);


router.get('/post/create', post_controller.post_create_get);


router.post('/post/create', post_controller.post_create_post);


router.get('/post/:id/delete', post_controller.post_delete_get);


router.post('/post/:id/delete', post_controller.post_delete_post);

router.get('/post/:id/update', post_controller.post_update_get);

router.post('/post/:id/update', post_controller.post_update_post);






router.get('/sign-up', user_controller.sign_up_get);


router.post('/sign-up', user_controller.sign_up_post);


router.get('/user/:id', user_controller.user_detail);

router.get('/users', user_controller.user_list);

router.get('/log-out', user_controller.log_out_get);


module.exports = router;