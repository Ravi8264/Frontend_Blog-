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


// User Data functions
export const saveUserData = async (userData) => {
  return await db.do("set", "userData", userData);
};

export const getUserDataFromDB = async () => {
  return await db.do("get", "userData");
};

// Clear all user-related data
export const clearUserDataFromDB = async () => {
  await db.do("clear");
};