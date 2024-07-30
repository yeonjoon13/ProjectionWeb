// src/components/Header.js

import React from 'react';
import { User, CalendarHeart, Info, FileText } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const Header = ({ collectedBy, collectedDate }) => {
    const { user } = useUser();
    const firstName = user?.fullName?.split(' ')[0]; // Extract the first name

  return (
    <header className="mt-10 py-4 px-12 ">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">{firstName}'s Blood Test</h1>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-600" />
            <span>For {user?.fullName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-600" />
            <span>By { collectedBy}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarHeart className="w-4 h-4 text-gray-600" />
            <span>Collected { collectedDate}</span>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
