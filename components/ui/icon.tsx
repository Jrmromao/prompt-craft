import { LucideIcon, User, CreditCard, Shield } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  user: User,
  'credit-card': CreditCard,
  shield: Shield,
};

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const IconComponent = iconMap[name] || User;
  return <IconComponent className={className} />;
} 