const express = require('express');
const router = express.Router();
const multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ dest: './public/uploads/' });
router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    // console.log({ file: req.file, body: req.body });
    res.status(201).json({
      status: 'success',
      data: req.file,
      body: req.body,
    });
  } catch (error) {
    res.status(401).json({
      status: 'success',
      error,
    });
  }
});

module.exports = router;
