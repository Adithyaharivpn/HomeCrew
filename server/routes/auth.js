const express = require('express');
const router = express.Router();

const { signup , login, getMe, checkUserUnique } = require('../controller/authcontroller'); 
const { SignupvalidateRules, validate } = require('../middleware/validate');
const upload = require('../middleware/multer');
const auth = require('../middleware/authMiddlware');

router.post('/signup', (req, res, next) => {
  upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'documents', maxCount: 3 }])(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      // Handle Multer/Cloudinary specific errors
      if (err.message === 'File too large') {
          return res.status(400).json({ error: "File too large" });
      }
      if (err.message && err.message.includes('format')) {
          return res.status(400).json({ error: "Unsupported file format. Allowed: jpg, png, pdf, webp" });
      }
      return res.status(400).json({ error: `Upload failed: ${err.message}` });
    }
    next();
  });
}, SignupvalidateRules(), validate, signup);
router.post('/check-unique', checkUserUnique);
router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;
