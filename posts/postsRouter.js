const express = require("express");
const router = express.Router();
const postDB = require("../data/helpers/postDb");
const userDB = require("../data/helpers/userDb");

// get post by id
router.get("/:userID/posts/:postID", (req, res) => {
  const { userID, postID } = req.params;
  userDB
    .getUserPosts(userID)
    .then(posts => {
      if (posts.length > 0) {
        let user = posts[0].postedBy; // check for post id ownership, post id will otherwise show for incorrect user
        postDB
          .get(postID)
          .then(post => {
            if (post.postedBy === user) {
              res.status(200).json(post);
            } else {
              res.status(404).json({
                message: `Post ID ${postID} does not exist for ${user}.`
              });
            }
          })
          .catch(() =>
            res
              .status(500)
              .json({ error: "The User information could not be retrieved." })
          );
      } else {
        res
          .status(404)
          .json({ message: `User ID ${userID} does not have any Posts.` });
      }
    })
    .catch(() =>
      res
        .status(500)
        .json({ error: "The User information could not be retrieved." })
    );
});

// get post tags by id

router.get("/:userID/posts/:postID/tags", (req, res) => {
  const { userID, postID } = req.params;
  userDB
    .getUserPosts(userID)
    .then(posts => {
      if (posts.length > 0) {
        let user = posts[0].postedBy; // check for post id ownership, post id will otherwise show for incorrect user
        postDB
          .get(postID)
          .then(post => {
            if (post.postedBy === user) {
              if (post.tags.length > 0) {
                res.status(200).json(post.tags);
              } else {
                res.status(404).json({
                  message: `User ID ${userID} Post ID ${postID} does not contain tags.`
                });
              }
            } else {
              res.status(404).json({
                message: `Post ID ${postID} does not exist for ${user}.`
              });
            }
          })
          .catch(() =>
            res
              .status(500)
              .json({ error: "The User information could not be retrieved." })
          );
      } else {
        res
          .status(404)
          .json({ message: `User ID ${userID} does not have any Posts.` });
      }
    })
    .catch(() =>
      res
        .status(500)
        .json({ error: "The User information could not be retrieved." })
    );
});

// post post

router.post("/:userID/posts", (req, res) => {
  const postInfo = req.body;
  postDB
    .insert(postInfo)
    .then(postid => {
      console.log(postid);
      res.status(200).json(postid);
    })
    .catch(() => {
      res.status(500).json({
        error: "There was an error while saving the user to the database."
      });
    });
});

// delete user
router.delete("/:userID/posts/:postID", (req, res) => {
  const { postID } = req.params;
  postDB
    .get(postID)
    .then(post => {
      if (post) {
        postDB.remove(postID).then(() => {
          res.status(200).json(post);
        });
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(() => {
      res.status(500).json({ error: "The post could not be removed" });
    });
});

// update user
router.put("/:userID/posts/:postID", (req, res) => {
  const { postID } = req.params;
  const postChanges = req.body;

  postDB.get(postID).then(post => {
    if (post) {
      postDB
        .update(postID, postChanges)
        .then(() => {
          postDB.get(postID).then(post => {
            res.status(200).json(post);
          });
        })
        .catch(() => {
          res
            .status(500)
            .json({ error: "The post information could not be modified." });
        });
    } else {
      res
        .status(404)
        .json({ message: "The post with the specified ID does not exist." });
    }
  });
});

module.exports = router;
