export class SocialService {
  async sharePrompt(promptId: string, platform: string) {
    return { success: true, url: `https://example.com/share/${promptId}` };
  }
}
