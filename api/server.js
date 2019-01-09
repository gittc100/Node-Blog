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

function checkAllCaps(req, res, next){
    const name = req.body.name;
    const arr = name.split(" ");
    let result;
    for(let i = 0; i < arr.length; i++){
        if(arr[i][0] !== arr[i][0].toUpperCase()){
            result = false;
        }else{
            result = true;
        }
    }
    if(result){
        next();
    }else{
        res.status(400).json({ message: "The User's entire name must be capitalized"});
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

// get all
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

// export server for use by index.js
module.exports = server;
