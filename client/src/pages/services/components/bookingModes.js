import { User, Target, FileText, Zap } from 'lucide-react';

export const bookingModes = [
  {
    id: 'DIRECT',
    title: 'Direct Worker Booking',
    description: 'Pick a worker and request a slot. The worker confirms.',
    icon: User,
    enabled: true,
  },
  {
    id: 'AUTO_ASSIGN',
    title: 'Service-First (Open Booking)',
    description: 'We broadcast your job to nearby workers.',
    icon: Target,
    enabled: true,
  },
  {
    id: 'BIDS',
    title: 'Request + Bids',
    description: 'Post a job and compare worker quotes.',
    icon: FileText,
    enabled: false,
  },
  {
    id: 'INSTANT',
    title: 'Instant / On-Demand',
    description: 'Get the nearest available worker now.',
    icon: Zap,
    enabled: false,
  },
];
