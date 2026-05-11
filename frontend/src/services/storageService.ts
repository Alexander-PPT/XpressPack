const TOKEN_KEY = 'rutasync_token';
const USER_KEY = 'rutasync_user';

export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const saveUser = (user: unknown) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = <T>() => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
};

export const clearSession = () => {
  clearToken();
  localStorage.removeItem(USER_KEY);
};
