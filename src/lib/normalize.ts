// Title-case ingredient/pantry names for consistent storage and display.
// Strips leading/trailing whitespace, collapses internal whitespace, and capitalizes each word.
export function normalizeIngredientName(name: string): string {
    return name
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
}
