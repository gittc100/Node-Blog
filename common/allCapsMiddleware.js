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

  module.exports = checkAllCaps;