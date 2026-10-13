export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  college: string;
  elo: number;
}

export function getLocalProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return {
      id: 'player-default',
      name: 'Player',
      handle: 'coder',
      college: 'Invertis University',
      elo: 1200,
    };
  }

  const stored = localStorage.getItem('codeclash_user_profile');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fallback
    }
  }

  const generated: UserProfile = {
    id: `usr_${Math.random().toString(36).substring(2, 9)}`,
    name: 'You',
    handle: `dev_${Math.floor(100 + Math.random() * 900)}`,
    college: 'Invertis University',
    elo: 1200,
  };

  localStorage.setItem('codeclash_user_profile', JSON.stringify(generated));
  return generated;
}

export function saveLocalProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('codeclash_user_profile', JSON.stringify(profile));
}
