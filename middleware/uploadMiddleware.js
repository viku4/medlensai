const multer = require('multer');
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid format.'), false);
};
module.exports = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });