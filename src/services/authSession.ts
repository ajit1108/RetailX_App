let authToken = "";
let authUser: any = null;

const resetSessionState = () => {
  authToken = "";
  authUser = null;
};

export async function setAuthSession(token: string, user: any) {
  authToken = token;
  authUser = user;
}

export async function loadAuthSession() {
  resetSessionState();
  return null;
}

export async function clearAuthSession() {
  resetSessionState();
}

export function getAuthToken() {
  return authToken;
}

export function getAuthUser() {
  return authUser;
}
