import multer from 'multer';

const upload = multer({
  limits: {
    fileSize: 1000000, //1mb
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a valid image file'));
    }
    cb(null, true);
  },
});

export { upload as multerUpload };
