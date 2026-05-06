/**
 * @file security.ts
 * @description Utilidades de cifrado ligero para proteger datos en LocalStorage.
 */

const SECRET_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || "beeper-sentinel-2026-secure-key";

/**
 * Cifra una cadena de texto usando una clave secreta (Simple XOR para demo/hackathon).
 * Para producción real, se recomienda Web Crypto API con llaves derivadas del dispositivo.
 */
export function encryptData(text: string): string {
  const textChars = text.split("");
  const keyChars = SECRET_KEY.split("");
  
  const encrypted = textChars.map((char, i) => {
    const charCode = char.charCodeAt(0);
    const keyCode = keyChars[i % keyChars.length].charCodeAt(0);
    return String.fromCharCode(charCode ^ keyCode);
  }).join("");

  return btoa(unescape(encodeURIComponent(encrypted))); // Base64 safe
}

/**
 * Descifra una cadena cifrada en Base64.
 */
export function decryptData(encoded: string): string {
  try {
    const encrypted = decodeURIComponent(escape(atob(encoded)));
    const keyChars = SECRET_KEY.split("");
    
    return encrypted.split("").map((char, i) => {
      const charCode = char.charCodeAt(0);
      const keyCode = keyChars[i % keyChars.length].charCodeAt(0);
      return String.fromCharCode(charCode ^ keyCode);
    }).join("");
  } catch (e) {
    console.error("[Security] Error al descifrar datos:", e);
    return "";
  }
}

/**
 * Helper para guardar objetos JSON cifrados.
 */
export function saveSecurely(key: string, data: unknown) {
  const stringified = JSON.stringify(data);
  const encrypted = encryptData(stringified);
  localStorage.setItem(key, encrypted);
}

/**
 * Helper para leer objetos JSON cifrados.
 */
export function loadSecurely<T>(key: string): T | null {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  
  const decrypted = decryptData(encrypted);
  try {
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

/**
 * Anonimiza un perfil de usuario para cumplir con la Ley 19.628 (Protección de Datos).
 * Se eliminan Nombres, RUTs y Emails antes de enviar datos al LLM.
 */
export function anonymizeProfile<T extends { nombre?: string; rut?: string; email?: string }>(profile: T): T {
  return {
    ...profile,
    nombre: "USUARIO_PROTEGIDO",
    rut: "XX.XXX.XXX-X",
    email: "email@protegido.cl"
  };
}
