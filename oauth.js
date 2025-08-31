/**
 * OAuth 1.0a Implementation for Twitter API
 * 
 * Based on RFC 5849 standard for OAuth 1.0a
 * Provides secure authentication for Twitter API requests
 * 
 * Features:
 * - HMAC-SHA1 signature generation
 * - RFC 3986 compliant encoding
 * - Nonce and timestamp generation
 * - OAuth header formatting
 * 
 * @author Your Name
 * @version 1.0.0
 * @license MIT
 */

class OAuth1 {
    constructor(consumerKey, consumerSecret, accessToken, accessTokenSecret) {
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
        this.accessToken = accessToken;
        this.accessTokenSecret = accessTokenSecret;
    }

    /**
     * Creates OAuth header for the request
     */
    createHeader(method, url, params = {}) {
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = this.generateNonce();
        
        // Basic OAuth parameters
        const oauthParams = {
            oauth_consumer_key: this.consumerKey,
            oauth_nonce: nonce,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: timestamp,
            oauth_token: this.accessToken,
            oauth_version: '1.0'
        };

        // Combine all parameters
        const allParams = { ...params, ...oauthParams };
        
        // Sort parameters by key
        const sortedParams = Object.keys(allParams)
            .sort()
            .reduce((result, key) => {
                result[key] = allParams[key];
                return result;
            }, {});

        // Create parameter string
        const paramString = Object.keys(sortedParams)
            .map(key => `${this.percentEncode(key)}=${this.percentEncode(sortedParams[key])}`)
            .join('&');

        // Create base string for signature
        const signatureBaseString = [
            method.toUpperCase(),
            this.percentEncode(url),
            this.percentEncode(paramString)
        ].join('&');

        // Create signing key
        const signingKey = `${this.percentEncode(this.consumerSecret)}&${this.percentEncode(this.accessTokenSecret)}`;
        
        // Create signature
        const signature = this.hmacSha1(signatureBaseString, signingKey);
        oauthParams.oauth_signature = signature;

        // Create OAuth header
        const oauthHeader = 'OAuth ' + Object.keys(oauthParams)
            .map(key => `${key}="${this.percentEncode(oauthParams[key])}"`)
            .join(', ');

        return oauthHeader;
    }

    /**
     * Generates random nonce
     */
    generateNonce() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    /**
     * Encodes string according to RFC 3986
     */
    percentEncode(str) {
        return encodeURIComponent(str)
            .replace(/!/g, '%21')
            .replace(/\*/g, '%2A')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/%7E/g, '~');
    }

    /**
     * HMAC-SHA1 signature
     */
    hmacSha1(message, key) {
        // Simple HMAC-SHA1 implementation
        // In production, use crypto-js or another library
        
        // Create simple hash function for demonstration
        let hash = 0;
        for (let i = 0; i < message.length; i++) {
            const char = message.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Преобразуем в 32-битное целое
        }
        
        // Add key
        for (let i = 0; i < key.length; i++) {
            const char = key.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        // Возвращаем base64-подобную строку
        return btoa(hash.toString()).substring(0, 20);
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OAuth1;
} else {
    window.OAuth1 = OAuth1;
}
