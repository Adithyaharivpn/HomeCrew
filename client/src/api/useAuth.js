import { useContext } from 'react';
import { AuthContext } from '../api/authContext'; 

export const useAuth = () => {
  return useContext(AuthContext);
};