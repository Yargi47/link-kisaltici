export function checkAuth() {
  if (typeof window === 'undefined') return null;
  
  const token = sessionStorage.getItem('authToken');
  const userType = sessionStorage.getItem('userType');
  const userInfo = sessionStorage.getItem('userInfo');

  if (!token || !userType || !userInfo) {
    return null;
  }

  return {
    token,
    userType: userType as 'admin' | 'customer',
    user: JSON.parse(userInfo)
  };
}

export function requireAuth(userType?: 'admin' | 'customer') {
  const auth = checkAuth();
  
  if (!auth) {
    window.location.href = '/login';
    return null;
  }

  if (userType && auth.userType !== userType) {
    window.location.href = '/login';
    return null;
  }

  return auth;
}

export function logout() {
  if (typeof window === 'undefined') return;
  
  const userType = sessionStorage.getItem('userType');
  
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('userType');
  sessionStorage.removeItem('userInfo');
  
  // Admin ise admin login sayfasına, müşteri ise customer login sayfasına yönlendir
  if (userType === 'admin') {
    window.location.href = '/admin-login';
  } else {
    window.location.href = '/login';
  }
}
