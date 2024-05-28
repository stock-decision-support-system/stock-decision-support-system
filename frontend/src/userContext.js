import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (username, is_superuser, is_staff) => {
    setUser({ username, is_superuser, is_staff });
    localStorage.setItem('username', username);
    localStorage.setItem('is_superuser', is_superuser);
    localStorage.setItem('is_staff', is_staff);
    // 可以同時儲存 token
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('username');
    localStorage.removeItem('is_superuser');
    localStorage.removeItem('is_staff');
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
