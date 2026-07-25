const IDENTITY_PATTERNS = [

    // Explicit identity statements
    /\bmy name is\b/i,
    /\bi am called\b/i,
    /\bcall me\b/i,
    /\byou can call me\b/i,

    // Username / handle sharing
    /\bmy username is\b/i,
    /\bmy user name is\b/i,
    /\bmy handle is\b/i,
    /\bmy discord is\b/i,
    /\bmy discord username is\b/i,
    /\bmy roblox is\b/i,
    /\bmy roblox username is\b/i,

    // Contact information
    /\bmy email is\b/i,
    /\bmy e-mail is\b/i,
    /\bemail me at\b/i,
    /\bcontact me at\b/i,
    /\badd me on\b/i,
    /\bmessage me on\b/i,

    // Social/contact handles
    /\bmy snap is\b/i,
    /\bmy snapchat is\b/i,
    /\bmy instagram is\b/i,
    /\bmy twitter is\b/i,
    /\bmy tiktok is\b/i,

    // Direct identity requests
    /\bwhat is your real name\b/i,
    /\bwhat's your real name\b/i,
    /\bwho are you in real life\b/i,
    /\bwhere do you live\b/i,
    /\bwhat is your address\b/i,
    /\bwhat's your address\b/i,

    // Phone numbers
    /\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/,

    // Email addresses
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i

];


export function containsIdentitySharing(
    message
) {

    return IDENTITY_PATTERNS.some(
        pattern =>
            pattern.test(message)
    );
}