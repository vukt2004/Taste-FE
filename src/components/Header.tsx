import React from 'react';
import { type User } from '../services/user';

interface HeaderProps {
  onLoginSuccess?: (user: User) => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginSuccess, onLogout }) => {
  return null;
};

export default Header;
