const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'homecrew_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  },
});

const upload = multer({ storage: storage });

module.exports = upload;