import { AuditLogger } from './audit-logger';

export interface ContentFilterResult {
  isAllowed: boolean;
  reason?: string;
  filteredContent?: string;
}

export class ContentFilter {
  private static instance: ContentFilter;
  private auditLogger: AuditLogger;

  // Define sensitive patterns and words
  private readonly SENSITIVE_PATTERNS = [
    /(?:https?:\/\/[^\s]+)/g, // URLs
    /(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, // Email addresses
    /(?:\b\d{16,19}\b)/g, // Credit card numbers
    /(?:\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)/g, // Phone numbers
  ];

  private readonly SENSITIVE_WORDS = new Set([
    'password',
    'secret',
    'token',
    'key',
    'credential',
    'api_key',
    'private_key',
    'ssh_key',
    'access_token',
    'refresh_token',
    'jwt',
    'bearer',
    'oauth',
    'auth',
    'authentication',
    'authorization',
  ]);

  private constructor() {
    this.auditLogger = AuditLogger.getInstance();
  }

  public static getInstance(): ContentFilter {
    if (!ContentFilter.instance) {
      ContentFilter.instance = new ContentFilter();
    }
    return ContentFilter.instance;
  }

  public async filterContent(
    content: string,
    userId?: string,
    context?: string
  ): Promise<ContentFilterResult> {
    try {
      // Check for sensitive patterns
      for (const pattern of this.SENSITIVE_PATTERNS) {
        if (pattern.test(content)) {
          const filteredContent = content.replace(pattern, '[REDACTED]');
          await this.logFilteredContent(userId, context, 'pattern', content, filteredContent);
          return {
            isAllowed: false,
            reason: 'Content contains sensitive information',
            filteredContent,
          };
        }
      }

      // Check for sensitive words
      const words = content.toLowerCase().split(/\s+/);
      const sensitiveWordsFound = words.filter(word => this.SENSITIVE_WORDS.has(word));

      if (sensitiveWordsFound.length > 0) {
        const filteredContent = this.redactSensitiveWords(content, sensitiveWordsFound);
        await this.logFilteredContent(userId, context, 'words', content, filteredContent);
        return {
          isAllowed: false,
          reason: 'Content contains sensitive words',
          filteredContent,
        };
      }

      return { isAllowed: true };
    } catch (error) {
      console.error('Content filtering failed:', error);
      // In case of error, allow the content but log the error
      await this.auditLogger.logSecurityEvent(
        'SECURITY_EVENT',
        'CONTENT_FILTER',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          content: content.substring(0, 100) + '...', // Log only first 100 chars
        },
        'ERROR'
      );
      return { isAllowed: true };
    }
  }

  private redactSensitiveWords(content: string, sensitiveWords: string[]): string {
    let filteredContent = content;
    for (const word of sensitiveWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filteredContent = filteredContent.replace(regex, '[REDACTED]');
    }
    return filteredContent;
  }

  private async logFilteredContent(
    userId: string | undefined,
    context: string | undefined,
    type: string,
    originalContent: string,
    filteredContent: string
  ): Promise<void> {
    await this.auditLogger.logSecurityEvent(
      'SECURITY_EVENT',
      'CONTENT_FILTER',
      {
        userId,
        context,
        type,
        originalContent: originalContent.substring(0, 100) + '...', // Log only first 100 chars
        filteredContent: filteredContent.substring(0, 100) + '...', // Log only first 100 chars
      },
      'FILTERED'
    );
  }
}
