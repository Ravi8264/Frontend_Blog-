export class StopsStore {
  constructor() {
    this.dbName = "User";
    this.storeName = "userdata";
  }

  async getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async do(action, key, data) {
    const db = await this.getDB();
    const store = db
      .transaction(this.storeName, "readwrite")
      .objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      let request;

      switch (action) {
        case "set":
          request = store.put({ key, data });
          request.onsuccess = () => resolve(data);
          break;

        case "get":
          request = store.get(key);
          request.onsuccess = () => resolve(request.result?.data);
          break;

        case "delete":
          request = store.delete(key);
          request.onsuccess = () => resolve(true);
          break;

        case "getAll":
          request = store.getAll();
          request.onsuccess = () =>
            resolve((request.result || []).map((item) => item.data));
          break;

        case "clear":
          request = store.clear();
          request.onsuccess = () => resolve(true);
          break;

        default:
          reject(new Error(`Invalid action: ${action}`));
          return;
      }

      request.onerror = () => reject(request.error);
    });
  }
}

const db = new StopsStore();

// Auth-related functions
export const saveTokenToDB = async (token) => {
  return await db.do("set", "authToken", token);
};

export const getTokenFromDB = async () => {
  return await db.do("get", "authToken");
};

// Refresh Token functions
export const saveRefreshTokenToDB = async (refreshToken) => {
  return await db.do("set", "refreshToken", refreshToken);
};

export const getRefreshTokenFromDB = async () => {
  return await db.do("get", "refreshToken");
};

// Save both tokens at once
export const saveTokensToDB = async (authData) => {
  const { token, refreshToken } = authData;

  const promises = [];
  if (token) {
    promises.push(db.do("set", "authToken", token));
  }
  if (refreshToken) {
    promises.push(db.do("set", "refreshToken", refreshToken));
  }

  return await Promise.all(promises);
};

// Get both tokens at once
export const getTokensFromDB = async () => {
  const [authToken, refreshToken] = await Promise.all([
    db.do("get", "authToken"),
    db.do("get", "refreshToken"),
  ]);

  return {
    token: authToken,
    refreshToken: refreshToken,
  };
};

export const saveUserData = async (userData) => {
  return await db.do("set", "userData", userData);
};

export const getUserDataFromDB = async () => {
  return await db.do("get", "userData");
};

// Save complete auth response (token, refreshToken, and user data)
export const saveCompleteAuthData = async (authResponse) => {
  const { token, refreshToken, user } = authResponse;

  const promises = [];
  if (token) {
    promises.push(db.do("set", "authToken", token));
  }
  if (refreshToken) {
    promises.push(db.do("set", "refreshToken", refreshToken));
  }
  if (user) {
    promises.push(db.do("set", "userData", user));
  }

  return await Promise.all(promises);
};

// Get complete auth data
export const getCompleteAuthData = async () => {
  const [authToken, refreshToken, userData] = await Promise.all([
    db.do("get", "authToken"),
    db.do("get", "refreshToken"),
    db.do("get", "userData"),
  ]);

  return {
    token: authToken,
    refreshToken: refreshToken,
    user: userData,
  };
};

// Clear only refresh token
export const clearRefreshTokenFromDB = async () => {
  return await db.do("delete", "refreshToken");
};

// Clear all auth data including refresh token
export const clearAllAuthDataFromDB = async () => {
  await db.do("delete", "authToken");
  await db.do("delete", "refreshToken");
  await db.do("delete", "userData");
  await db.do("delete", "routeLogs");
  console.log("All auth data cleared from IndexedDB (including refresh token)");
};

// Clear entire database - use this if you want to completely wipe all data
export const clearEntireDB = async () => {
  return await db.do("clear");
};

export const storeRouteLogs = async (routeLogsData) => {
  if (routeLogsData) {
    await db.do("set", "routeLogs", routeLogsData);
  }
};
