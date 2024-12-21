import React from 'react';
import Image from 'next/image';

// Extended User interface to include all required properties
interface User {
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role?: string;
  department?: string;
  skills?: string;
}

interface UserCardProps {
  user: User;
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'outline' | 'filled';
}

const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'filled'
}) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variantStyles = variant === 'outline' ? 'border border-current bg-transparent' : 'bg-gray-100';
  
  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-4">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={`${user.username}'s avatar`}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold">{user.username}</h2>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Bio:</h3>
          <p className="text-sm text-gray-700">
            {user.bio || "No bio provided"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email:</h3>
            <p className="text-sm text-gray-700">{user.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Role:</h3>
            <Badge variant="outline" className="text-blue-600">
              {user.role || 'Member'}
            </Badge>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Department:</h3>
          <p className="text-sm text-gray-700">{user.department || "Not set"}</p>
        </div>

        {user.skills && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Skills:</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.split(',').map((skill: string) => (
                <Badge key={skill} className="text-green-600">
                  {skill.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;