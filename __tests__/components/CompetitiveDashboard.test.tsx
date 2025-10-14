import { render, screen, fireEvent } from '@testing-library/react';
import { CompetitiveDashboard } from '@/components/competitive/CompetitiveDashboard';

// Mock data
const mockProps = {
  userRank: { rank: 5, total: 100 },
  topCreators: [
    {
      userId: '1',
      username: 'John Doe',
      avatar: 'avatar1.jpg',
      score: 1000,
      rank: 1,
      badge: '👑'
    },
    {
      userId: '2',
      username: 'Jane Smith',
      avatar: 'avatar2.jpg',
      score: 800,
      rank: 2,
      badge: '🥈'
    }
  ],
  achievements: [
    {
      id: 'first_prompt',
      title: 'First Steps',
      icon: '🌱',
      earned: true,
      rarity: 'common'
    },
    {
      id: 'viral_prompt',
      title: 'Viral Creator',
      icon: '🚀',
      earned: false,
      rarity: 'epic'
    }
  ],
  activeChallenges: [
    {
      id: 'challenge1',
      title: 'Weekly Challenge: Creative Writing',
      theme: 'Creative Writing',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      participants: 25
    }
  ]
};

describe('CompetitiveDashboard', () => {
  it('should render user stats correctly', () => {
    render(<CompetitiveDashboard {...mockProps} />);

    expect(screen.getByText('#5')).toBeInTheDocument();
    expect(screen.getByText('Your Rank')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(2); // Multiple "1" elements expected
    expect(screen.getAllByText('Achievements')).toHaveLength(2); // Header and stats
  });

  it('should render leaderboard with correct rankings', () => {
    render(<CompetitiveDashboard {...mockProps} />);

    expect(screen.getByText('Top Creators')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('1000 upvotes')).toBeInTheDocument();
    expect(screen.getByText('👑')).toBeInTheDocument();

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('800 upvotes')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
  });

  it('should render active challenges', () => {
    render(<CompetitiveDashboard {...mockProps} />);

    expect(screen.getAllByText('Active Challenges')).toHaveLength(2); // Header and stats
    expect(screen.getByText('Weekly Challenge: Creative Writing')).toBeInTheDocument();
    expect(screen.getByText('Creative Writing')).toBeInTheDocument();
    expect(screen.getByText('25 participants')).toBeInTheDocument();
    expect(screen.getByText('Join Challenge')).toBeInTheDocument();
  });

  it('should render achievements with earned status', () => {
    render(<CompetitiveDashboard {...mockProps} />);

    expect(screen.getAllByText('Achievements')).toHaveLength(2); // Header and stats
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.getByText('Viral Creator')).toBeInTheDocument();

    // Check for earned vs unearned styling
    const achievements = screen.getAllByText(/common|epic/);
    expect(achievements).toHaveLength(2);
  });

  it('should handle empty data gracefully', () => {
    const emptyProps = {
      userRank: { rank: 0, total: 0 },
      topCreators: [],
      achievements: [],
      activeChallenges: []
    };

    render(<CompetitiveDashboard {...emptyProps} />);

    expect(screen.getByText('#0')).toBeInTheDocument();
    expect(screen.getByText('Top Creators')).toBeInTheDocument();
    expect(screen.getAllByText('Active Challenges')).toHaveLength(2); // Header and stats
  });

  it('should handle challenge join button click', () => {
    render(<CompetitiveDashboard {...mockProps} />);

    const joinButton = screen.getByText('Join Challenge');
    fireEvent.click(joinButton);

    // Button should still be present (no navigation in test)
    expect(joinButton).toBeInTheDocument();
  });

  it('should display correct streak information', () => {
    render(<CompetitiveDashboard {...mockProps} />);

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Day Streak')).toBeInTheDocument();
  });

  it('should show achievement rarity badges', () => {
    render(<CompetitiveDashboard {...mockProps} />);

    expect(screen.getByText('common')).toBeInTheDocument();
    expect(screen.getByText('epic')).toBeInTheDocument();
  });
});
