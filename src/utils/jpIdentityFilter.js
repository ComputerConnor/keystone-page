const IDENTITY_PATTERNS = [

    // Direct identity statements
    /\bmy\s+(?:real\s+)?name\s+is\b/i,
    /\bi(?:'m| am)\s+(?:actually\s+)?called\b/i,
    /\bcall\s+me\b/i,
    /\byou\s+can\s+call\s+me\b/i,
    /\bpeople\s+call\s+me\b/i,
    /\bknown\s+as\b/i,

    // Usernames and account handles
    /\bmy\s+(?:user\s*name|handle|account|tag)\s+is\b/i,
    /\bmy\s+discord(?:\s+username|\s+tag)?\s+is\b/i,
    /\bmy\s+roblox(?:\s+username)?\s+is\b/i,
    /\bmy\s+steam(?:\s+name|\s+account)?\s+is\b/i,
    /\bmy\s+xbox(?:\s+gamertag)?\s+is\b/i,
    /\bmy\s+psn(?:\s+name)?\s+is\b/i,
    /\badd\s+me\s+(?:on|at)\b/i,
    /\bdm\s+me\s+(?:on|at)\b/i,
    /\bmessage\s+me\s+(?:on|at)\b/i,

    // Email and phone
    /\bmy\s+(?:e-?mail|phone|number)\s+is\b/i,
    /\be-?mail\s+me\s+at\b/i,
    /\bcontact\s+me\s+at\b/i,
    /\btext\s+me\s+at\b/i,
    /\bcall\s+me\s+at\b/i,

    // Social media
    /\bmy\s+(?:snap|snapchat|instagram|insta|twitter|tiktok|facebook|reddit|telegram)\s+is\b/i,

    // Location and physical identity
    /\bi\s+live\s+(?:at|in|near)\b/i,
    /\bmy\s+address\s+is\b/i,
    /\bmy\s+school\s+is\b/i,
    /\bi\s+go\s+to\s+school\s+at\b/i,
    /\bi\s+work\s+at\b/i,
    /\bmy\s+workplace\s+is\b/i,
    /\bmy\s+city\s+is\b/i,
    /\bmy\s+state\s+is\b/i,
    /\bmy\s+zip\s+code\s+is\b/i,

    // Identity requests
    /\bwhat(?:'s| is)\s+your\s+(?:real\s+)?name\b/i,
    /\bwho\s+are\s+you\s+in\s+real\s+life\b/i,
    /\bwhere\s+do\s+you\s+live\b/i,
    /\bwhere\s+are\s+you\s+from\b/i,
    /\bwhat(?:'s| is)\s+your\s+address\b/i,
    /\bwhat(?:'s| is)\s+your\s+discord\b/i,
    /\bwhat(?:'s| is)\s+your\s+username\b/i,
    /\bwhat\s+school\s+do\s+you\s+go\s+to\b/i,

    // Phone numbers
    /\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,

    // Email addresses
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,

    // IPv4 addresses
    /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/,

    // Discord-style legacy tags
    /\b[A-Za-z0-9_.-]{2,32}#\d{4}\b/,

    // URLs that could reveal profiles or contact pages
    /\bhttps?:\/\/(?:www\.)?(?:discord\.gg|discord\.com|instagram\.com|x\.com|twitter\.com|tiktok\.com|facebook\.com|snapchat\.com|reddit\.com|steamcommunity\.com|roblox\.com)\S*/i

];


function normalizeIdentityText(
    message
) {

    return String(message || "")
        .normalize("NFKC")
        .replace(
            /[\u200B-\u200D\uFEFF]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


export function containsIdentitySharing(
    message
) {

    const normalizedMessage =
        normalizeIdentityText(
            message
        );

    if (!normalizedMessage) {
        return false;
    }

    return IDENTITY_PATTERNS.some(
        pattern =>
            pattern.test(
                normalizedMessage
            )
    );
}
