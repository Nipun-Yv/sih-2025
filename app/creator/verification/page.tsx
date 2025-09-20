// app/creator/verification/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Youtube, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export default function VerificationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [creator, setCreator] = useState<any>(null);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    fetchCreator();
  }, []);

  const fetchCreator = async () => {
    try {
      const response = await fetch('/api/creator/init');
      const data = await response.json();
      
      if (response.ok && data.creator) {
        setCreator(data.creator);
      } else {
        setError('Failed to load creator data');
      }
    } catch (error) {
      setError('Failed to load creator data');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleYouTubeConnect = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/creator/verify-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mockData: true 
        }),
      });

      if (!response.ok) throw new Error('Verification failed');

      const data = await response.json();
      setCreator(data.creator);
      
      // Redirect to analytics after successful verification
      setTimeout(() => {
        router.push('/creator/analytics');
      }, 2000);
    } catch (error) {
      setError('Failed to verify YouTube channel');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 border border-orange-100 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isVerified = creator?.status !== 'unverified' && creator?.youtubeChannelId;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">YouTube Verification</h1>
        <p className="text-gray-600 mt-2">
          Connect your YouTube channel to calculate your engagement score
        </p>
      </div>

      <div className="bg-white rounded-xl p-8 border border-orange-100">
        {isVerified ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Channel Verified!
            </h3>
            <p className="text-gray-600 mb-6">
              Your YouTube channel has been successfully connected.
            </p>
            
            {creator?.channelData && (
              <div className="bg-orange-50 rounded-lg p-6 text-left max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={creator.channelData.thumbnailUrl || `/api/placeholder/64/64`} 
                    alt="Channel"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {creator.channelData.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {creator.channelData.subscriberCount.toLocaleString()} subscribers
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => router.push('/creator/analytics')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  View Analytics
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <Youtube className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect Your YouTube Channel
              </h3>
              <p className="text-gray-600">
                We'll analyze your recent videos to calculate your engagement score
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">What we'll access:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Your channel name and profile picture</li>
                  <li>• Subscriber count and video statistics</li>
                  <li>• Engagement metrics from your recent videos</li>
                  <li>• Public video performance data</li>
                </ul>
              </div>

              <Button
                onClick={handleYouTubeConnect}
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Youtube className="h-5 w-5 mr-2" />
                    Connect YouTube Channel
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}