export class LeaderboardService {
  async getTopUsers(limit: number = 10) {
    return [];
  }

  async getUserRank(userId: string) {
    return { rank: 0, score: 0 };
  }
}
