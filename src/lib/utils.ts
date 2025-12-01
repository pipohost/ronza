import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const serializeTimestamps = (obj: any): any => {
    if (!obj) return obj;

    if (Array.isArray(obj)) {
        return obj.map(serializeTimestamps);
    }
    
    if (typeof obj === 'object' && obj !== null) {
         // Handle Firestore Timestamp
        if (obj.hasOwnProperty('_seconds') && obj.hasOwnProperty('_nanoseconds') && typeof obj.toDate === 'function') {
            return obj.toDate().toISOString();
        }

        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = serializeTimestamps(obj[key]);
            }
        }
        return newObj;
    }
    
    // Return primitives and other types as is
    return obj;
};
