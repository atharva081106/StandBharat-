export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'WAITING' | 'PAUSED' | 'IDLE';
  tier?: 'FREE' | 'PRO';
  resourceProfile?: 'LIGHTWEIGHT' | 'STANDARD' | 'HEAVY';
  creditCost?: number;
  capabilities?: string[];
  isOkaraParity?: boolean;
  isStandBharatExclusive?: boolean;
}

