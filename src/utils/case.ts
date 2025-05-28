export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toSnakeCase);

    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
            k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
            typeof v === 'object' && v !== null ? toSnakeCase(v) : v,
        ])
    );
}
