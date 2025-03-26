// This file is no longer used as we've switched to local file uploads
// Keeping as a placeholder in case there are references to it elsewhere in the code
module.exports = {
    uploader: {
        upload: () => {
            console.warn('Cloudinary upload called but application is using local file storage');
            return Promise.reject(new Error('Cloudinary disabled'));
        }
    }
};
