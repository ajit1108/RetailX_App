let authToken = "";
let authUser: any = null;

export function setAuthSession(token: string, user: any) {
  authToken = token;
  authUser = user;
}

export function clearAuthSession() {
  authToken = "";
  authUser = null;
}

export function getAuthToken() {
  return authToken;
}

export function getAuthUser() {
  return authUser;
}
