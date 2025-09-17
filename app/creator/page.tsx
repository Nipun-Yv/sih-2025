import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import Creator from '@/models/Creator';
import CreatorCard from './components/CreatorCard';
import StatusTimeline from './components/StatusTimeline';
import MetricCard from './components/MetricCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function CreatorDashboard() {
  const user = await currentUser();
  await dbConnect();
  
  const creator = await Creator.findOne({ clerkUserId: user?.id });
  
  const getNextAction = () => {
    switch (creator?.status) {
      case 'unverified':
        return { text: 'Verify YouTube Channel', href: '/creator/verification' };
      case 'verified':
        return { text: 'View Analytics', href: '/creator/analytics' };
      case 'tier_assigned':
        return { text: 'View Incentives', href: '/creator/incentives' };
      case 'contract_pending':
        return { text: 'Sign Contract', href: '/creator/contract' };
      case 'contract_signed':
        return { text: 'Plan Journey', href: '/attractions' };
      default:
        return null;
    }
  };
  
  const nextAction = getNextAction();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'Creator'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Track your progress and manage your Jharkhand tourism content journey.
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard
          label="Current Status"
          value={creator?.status.replace('_', ' ').toUpperCase() || 'UNVERIFIED'}
          icon="status"
        />
        <MetricCard
          label="Engagement Score"
          value={creator?.analytics?.engagementScore || '--'}
          suffix="/100"
          icon="score"
        />
        <MetricCard
          label="Tier"
          value={creator?.tier?.toUpperCase() || 'Not Assigned'}
          icon="tier"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Creator Profile Card */}
        <div className="lg:col-span-2">
          <CreatorCard creator={creator} />
        </div>

        {/* Status Timeline */}
        <div>
          <StatusTimeline currentStatus={creator?.status || 'unverified'} />
        </div>
      </div>

      {/* Call to Action */}
      {nextAction && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Next Step</h3>
          <p className="text-gray-600 mb-4">
            Continue your journey to become a Jharkhand tourism content creator.
          </p>
          <Link href={nextAction.href}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              {nextAction.text}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}