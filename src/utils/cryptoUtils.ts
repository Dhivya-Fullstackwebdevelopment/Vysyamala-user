import CryptoJS from "crypto-js";

// In production, move this to your .env file
const SECRET_KEY = "vysyamala-secure-key-123"; 

export const encryptId = (id: string): string => {
  const cipher = CryptoJS.AES.encrypt(id, SECRET_KEY).toString();
  // Make it URL safe (replace +, /, and =)
  return btoa(cipher).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decryptId = (encryptedId: string): string => {
  try {
    // Restore original Base64 characters
    let base64 = encryptedId.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    
    const bytes = CryptoJS.AES.decrypt(atob(base64), SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error("Decryption failed", e);
    return "";
  }
};