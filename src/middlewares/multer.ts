import multer from 'multer';

const upload = multer({
  limits: {
    fileSize: 10000000, //1mb
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/) && !file.originalname.match(/\.(mp4|3gp|avi|WebM)$/)) {
      return cb(new Error('Please upload a valid image or video file'));
    }
    cb(null, true);
  },
});

export { upload as multerUpload };
