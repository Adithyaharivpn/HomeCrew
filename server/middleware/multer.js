const multer = require('multer');
const path = require('path');

// 1. Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // The folder where images will be saved
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename to prevent overwriting
    // It will be something like: 1678886400000-profile.jpg
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// 2. Configure File Filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedFileTypes.test(file.mimetype);
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed!'), false);
};

// 3. Initialize Multer with the configurations
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
  fileFilter: fileFilter
});

module.exports = upload;