const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// cloudinary.config({
//   cloud_name: "",
//   api_key: "",
//   api_secret: "",
// });
cloudinary.config({
  cloud_name: 'dzwci1fjt', 
  api_key: '676928827956358', 
  api_secret: 'dvLPJDfElp5lxBoE14CArGcu43c'
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
