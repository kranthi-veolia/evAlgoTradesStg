import { Preferences } from '@capacitor/preferences';

// Save data
export async function saveData(key, value) {
  await Preferences.set({
    key: key,
    value: JSON.stringify(value)
  });
}

// Get data
export async function getData(key) {
  const { value } = await Preferences.get({ key: key });
  return value ? JSON.parse(value) : null;
}

// Remove data
export async function removeData(key) {
  await Preferences.remove({ key: key });
}

// Clear all data
export async function clearData() {
  await Preferences.clear();
}

// Authentication specific helper functions
export const AUTH_KEYS = {
  USER_INFO: 'user_info',
  AUTH_TOKEN: 'auth_token'
};

export async function saveUserInfo(userInfo) {
  await saveData(AUTH_KEYS.USER_INFO, userInfo);
}

export async function getUserInfo() {
  return await getData(AUTH_KEYS.USER_INFO);
}

export async function saveAuthToken(token) {
  await saveData(AUTH_KEYS.AUTH_TOKEN, token);
}

export async function getAuthToken() {
  return await getData(AUTH_KEYS.AUTH_TOKEN);
}

export async function clearAuthData() {
  await removeData(AUTH_KEYS.USER_INFO);
  await removeData(AUTH_KEYS.AUTH_TOKEN);
  await removeData('approvalStatus');
  await removeData('customUser');
}

export async function isLoggedIn() {
  const userInfo = await getUserInfo();
  return !!userInfo;
}

  
  // Helper functions for storing and retrieving approval status
  export const getStoredApprovalStatus = async (userId) => {
    const { value } = await Preferences.get({ key: `approvalStatus_${userId}` });
    return value ? parseInt(value) : null;
  };
  
  export const setStoredApprovalStatus = async (userId, status) => {
    await Preferences.set({
      key: `approvalStatus_${userId}`,
      value: status.toString()
    });
  };

// Check authentication state
export const checkAuthState = async () => {
  try {
    const userInfo = await getUserInfo();
    return userInfo; // Will be null if not logged in
  } catch (error) {
    console.error('Error checking auth state:', error);
    return null;
  }
};