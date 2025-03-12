// const path = require('path');
// const crypto = require('crypto');
// const multer = require('multer');

// module.exports = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '..', 'public', 'courses', 'covers'));
//   },
//   filename: (req, file, cb) => {
//     const sha256 = crypto.createHash('SHA256');
//     const hashedFileName = sha256.update(file.originalname).digest('hex');
//     cb(null, hashedFileName + path.extname(file.originalname));
//   },
// });


const multer = require('multer');

module.exports = multer({
  storage: multer.memoryStorage(), // ذخیره فایل در RAM
  limits: { fileSize: 50 * 1024 * 1024 }, // محدودیت ۵ مگابایت
});
