import React from 'react';
import { useAuth } from '../context/AuthContext';
import VisitorProfile from '../components/profile/VisitorProfile';
import ExhibitorProfile from '../components/profile/ExhibitorProfile';

const Profile = () => {
    const { user } = useAuth();

    return user?.userType === 'visitor' ? <VisitorProfile /> : <ExhibitorProfile />;
};

export default Profile; 