// In client/src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../api/authContext'; // This import will now work

export const useAuth = () => {
  return useContext(AuthContext);
};