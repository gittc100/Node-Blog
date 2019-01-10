const express = require("express");
const router = express.Router();
const userDB = require("../data/helpers/userDb");
const checkAllCaps = require("../common/allCapsMiddleware");

router.get("/", (req, res) => {
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

router.get("/:userID/posts", (req, res) => {
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

router.get("/:id", (req, res) => {
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

router.post("/", checkAllCaps, (req, res) => {
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

router.delete("/:id", (req, res) => {
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

router.put("/:id", checkAllCaps, (req, res) => {
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

module.exports = router;
