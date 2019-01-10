// imports
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

// DB import
const userDB = require("../data/helpers/userDb");
const postDB = require("../data/helpers/postDb");

// create server instance
const server = express();

// Custom Middleware

function checkAllCaps(req, res, next) {
  const { name } = req.body;
  const arr = name.split(" ");
  let result;
  for (let i = 0; i < arr.length; i++) {
    let firstLetter = arr[i][0];
    if (firstLetter !== firstLetter.toUpperCase()) {
      result = false;
      break;
    } else {
      result = true;
    }
  }
  if (result) {
    next();
  } else {
    res
      .status(400)
      .json({ message: "The User's entire name must be capitalized" });
  }
}

// Middleware
server.use(morgan("short")); // looging third party middleware
server.use(helmet()); // security
server.use(express.json()); // built-in json parser incoming and out going
server.use(cors()); // security cross domain

//Routing

// Initial Check for routing
// server.get("/", (req, res) => {
//   res.send(`sanity check success`);
// });

// userDB
// get all users
server.get("/api/users", (req, res) => {
  userDB
    .get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(() => {
      res.status(500).json({
        error: "The user information could not be retrieved."
      });
    });
});

// get all posts
server.get("/api/users/:userID/posts", (req, res) => {
  const { userID } = req.params;
  userDB
    .getUserPosts(userID)
    .then(posts => {
      if (posts.length > 0) {
        res.status(200).json(posts);
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

// get by id
server.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  userDB
    .get(id)
    .then(user => {
      if (user) {
        res.status(200).json(user);
      } else {
        res
          .status(404)
          .json({ message: "The User with the specified ID does not exist." });
      }
    })
    .catch(() =>
      res
        .status(500)
        .json({ error: "The User information could not be retrieved." })
    );
});

// post user
server.post("/api/users", checkAllCaps, (req, res) => {
  const userInfo = req.body;
  console.log(userInfo);
  if (!userInfo.name) {
    res.status(400).json({
      errorMessage: "Please provide name for the user."
    });
  } else {
    userDB
      .insert(userInfo)
      .then(resultId => {
        userDB
          .get(resultId.id)
          .then(user => {
            res.status(201).json(user);
          })
          .catch(() =>
            res
              .status(500)
              .json({ error: "The user information could not be retrieved." })
          );
      })
      .catch(() => {
        res.status(500).json({
          error: "There was an error while saving the user to the database"
        });
      });
  }
});

// delete user
server.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  userDB
    .get(id)
    .then(user => {
      if (user) {
        userDB.remove(id).then(() => {
          res.status(200).json(user);
        });
      } else {
        res
          .status(404)
          .json({ message: "The user with the specified ID does not exist." });
      }
    })
    .catch(() => {
      res.status(500).json({ error: "The user could not be removed" });
    });
});

// update user
server.put("/api/users/:id", checkAllCaps, (req, res) => {
  const { id } = req.params;
  const userChanges = req.body;

  if (!userChanges.name) {
    res.status(400).json({
      errorMessage: "Please provide name of the user."
    });
  } else {
    userDB.get(id).then(user => {
      if (user) {
        userDB
          .update(id, userChanges)
          .then(() => {
            userDB.get(id).then(user => {
              res.status(200).json(user);
            });
          })
          .catch(() => {
            res
              .status(500)
              .json({ error: "The user information could not be modified." });
          });
      } else {
        res
          .status(404)
          .json({ message: "The user with the specified ID does not exist." });
      }
    });
  }
});

//postDB;

// get post by id
server.get("/api/users/:userID/posts/:postID", (req, res) => {
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

server.get("/api/users/:userID/posts/:postID/tags", (req, res) => {
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
              if(post.tags.length > 0){
                res.status(200).json(post.tags);
              }else{
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

server.post("/api/users/:userID/posts", (req, res) => {
  const postInfo = req.body;

  postDB
    .insert(postInfo)
    .then(postid => {
      console.log(postid);
      res.status(200).json(postid);
    })
    .catch(() => {
      res
        .status(500)
        .json({
          error: "There was an error while saving the user to the database."
        });
    });
});

// delete user
server.delete("/api/users/:userID/posts/:postID", (req, res) => {
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
server.put("/api/users/:userID/posts/:postID", (req, res) => {
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

// export server for use by index.js
module.exports = server;
