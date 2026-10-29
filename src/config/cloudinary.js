const cloudinary = require('cloudinary').v2;

let isConfigured = false;

const initCloudinary = () => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    isConfigured = true;
    console.log('✅ Cloudinary configured');
  } else {
    console.warn('⚠️  Cloudinary not configured. File uploads will use local fallback.');
  }
};

const isCloudinaryConfigured = () => isConfigured;

module.exports = { cloudinary, initCloudinary, isCloudinaryConfigured };
