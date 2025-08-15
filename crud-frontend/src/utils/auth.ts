// Authentication utility functions

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse the token, consider it expired
  }
};

export const getTokenExpiration = (token: string): Date | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

export const getTokenPayload = (token: string): any => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (error) {
    return null;
  }
};

export const checkAuthStatus = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    return false;
  }

  return true;
};

export const clearAuthData = (): void => {
  localStorage.removeItem("token");
  // Clear any other auth-related data
  sessionStorage.clear();
};
