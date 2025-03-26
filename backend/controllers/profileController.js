const Profile = require('../models/Profile');
const User = require('../models/User');

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
        res.status(500).json({ message: error.message });
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
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Update profile with new photo URL
        profile.avatar = req.file.path;
        await profile.save();

        res.json({ 
            message: 'Profile photo updated successfully',
            photoUrl: profile.avatar 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 