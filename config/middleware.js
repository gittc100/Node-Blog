const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

module.exports = server => {
  // middleware order important
  server.use(morgan("short")); // looging third party middleware
  server.use(helmet()); // security
  server.use(express.json()); // built-in json parser incoming and out going
  server.use(cors()); // security cross domain
  // server.use(doubler); // global
  //server.use('/api/products', secure, productRouter); example
};
