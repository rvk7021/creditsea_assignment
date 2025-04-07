export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };
  
  export const getUserRole = () => {
    return localStorage.getItem('role'); 
  };
  