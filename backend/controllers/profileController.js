const Profile = require('../models/Profile');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Make sure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

exports.getProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user._id });
        
        if (!profile) {
            // Create default profile if it doesn't exist
            profile = new Profile({
                user: req.user._id,
                [req.user.userType === 'visitor' ? 'visitorProfile' : 'exhibitorProfile']: {}
            });
            await profile.save();
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { avatar, bio, address, ...profileData } = req.body;
        
        let profile = await Profile.findOne({ user: req.user._id });
        
        if (!profile) {
            profile = new Profile({ user: req.user._id });
        }

        // Update common fields
        profile.avatar = avatar || profile.avatar;
        profile.bio = bio || profile.bio;
        profile.address = address || profile.address;

        // Update type-specific fields
        if (req.user.userType === 'visitor') {
            profile.visitorProfile = {
                ...profile.visitorProfile,
                ...profileData.visitorProfile
            };
        } else {
            profile.exhibitorProfile = {
                ...profile.exhibitorProfile,
                ...profileData.exhibitorProfile
            };
        }

        await profile.save();
        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

exports.uploadProfilePhoto = async (req, res) => {
    try {
        console.log('Upload request received:', {
            file: req.file ? 'File received' : 'No file received',
            body: req.body,
            user: req.user ? req.user._id : 'No user'
        });

        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No file uploaded' 
            });
        }

        // Find user profile
        let profile = await Profile.findOne({ user: req.user._id });
        if (!profile) {
            // Create new profile if it doesn't exist
            profile = new Profile({ 
                user: req.user._id,
                [req.user.userType === 'visitor' ? 'visitorProfile' : 'exhibitorProfile']: {}
            });
        }

        // Create a public URL for the uploaded file
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;

        // Update the profile with the image URL
        profile.avatar = fileUrl;
        await profile.save();

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            photoUrl: fileUrl
        });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to upload profile photo',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};