import React from 'react';

interface AvatarProps {
  name?: string;
  phoneNumber?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ name, phoneNumber, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const getInitials = () => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (phoneNumber) {
      return phoneNumber.slice(-2);
    }
    return '?';
  };

  const getColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
    ];
    const str = name || phoneNumber || '';
    const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div
      className={`${sizeClasses[size]} ${getColor()} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    >
      {getInitials()}
    </div>
  );
}
