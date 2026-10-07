/**
 * Mask phone number for display
 * Indian format: Shows only last 4 digits with asterisks
 * 9876543210 -> ****3210
 * +91 9876543210 -> +91 ****3210
 */
export function maskPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';

    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // If starts with +91 (India), keep +91 and last 4 digits
    if (cleaned.startsWith('+91')) {
        const lastFour = cleaned.slice(-4);
        return `+91 ****${lastFour}`;
    }

    // If starts with 91 (India), keep last 4 digits
    if (cleaned.startsWith('91') && cleaned.length >= 12) {
        const lastFour = cleaned.slice(-4);
        return `****${lastFour}`;
    }

    // For 10-digit Indian number
    if (cleaned.length === 10) {
        const lastFour = cleaned.slice(-4);
        return `****${lastFour}`;
    }

    // Fallback: show last 4 digits
    if (cleaned.length >= 4) {
        const lastFour = cleaned.slice(-4);
        return `${'*'.repeat(cleaned.length - 4)}${lastFour}`;
    }

    return '****';
}

/**
 * Validate Indian phone number
 */
export function isValidIndianPhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // +91 9876543210 (12 digits)
    if (cleaned.startsWith('+91') && cleaned.length === 13) {
        return /^\+91[6-9]\d{9}$/.test(cleaned);
    }

    // 919876543210 (12 digits)
    if (cleaned.startsWith('91') && cleaned.length === 12) {
        return /^91[6-9]\d{9}$/.test(cleaned);
    }

    // 9876543210 (10 digits)
    if (cleaned.length === 10) {
        return /^[6-9]\d{9}$/.test(cleaned);
    }

    return false;
}
