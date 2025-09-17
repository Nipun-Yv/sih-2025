import { TrendingUp, Award, Activity } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: 'status' | 'score' | 'tier';
}

export default function MetricCard({ label, value, suffix, icon }: MetricCardProps) {
  const icons = {
    status: Activity,
    score: TrendingUp,
    tier: Award,
  };
  
  const Icon = icons[icon];
  
  return (
    <div className="bg-white rounded-xl p-6 border border-orange-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <Icon className="h-5 w-5 text-orange-500" />
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
        {suffix && <span className="text-lg font-normal text-gray-500">{suffix}</span>}
      </div>
    </div>
  );
}