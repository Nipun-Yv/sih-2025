import { Youtube, Calendar, Users } from 'lucide-react';
import { ICreator } from '@/models/Creator';
import TierBadge from './TierBadge';

interface CreatorCardProps {
  creator: ICreator | null;
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  if (!creator) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-orange-100">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Creator Profile</h3>
          <p className="text-gray-600 mt-1">Your channel information and stats</p>
        </div>
        {creator.tier && <TierBadge tier={creator.tier} />}
      </div>

      {creator.channelData ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {creator.channelData.thumbnailUrl && (
              <img 
                src={creator.channelData.thumbnailUrl} 
                alt="Channel"
                className="w-16 h-16 rounded-full border-2 border-orange-100"
              />
            )}
            <div>
              <h4 className="font-semibold text-gray-900">{creator.channelData.name}</h4>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Youtube className="h-4 w-4" />
                YouTube Channel
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Subscribers</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {creator.channelData.subscriberCount.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Total Videos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {creator.channelData.videoCount}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Connect your YouTube channel to get started</p>
        </div>
      )}
    </div>
  );
}