export function isPlainObject (val: unknown):boolean {
    return val != null && typeof val === "object" && Object.getPrototypeOf(val) === Object.prototype 
}

export function hashString (str: string):string {
    let hash = 0;
    if (str.length === 0) return String(hash);
    for (const [i] of str.split('').entries()) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return String(hash);
  }
  