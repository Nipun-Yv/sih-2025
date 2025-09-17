'use client';

import { ExternalLink, Calendar, Eye, Heart, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ContentSubmissionCardProps {
  submission: any;
}

export default function ContentSubmissionCard({ submission }: ContentSubmissionCardProps) {
  const platformIcons = {
    youtube: '🎥',
    instagram: '📷',
    twitter: '🐦',
    blog: '📝',
    other: '🌐',
  };

  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock,
      label: 'Under Review',
    },
    approved: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Approved',
    },
    needs_revision: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertCircle,
      label: 'Needs Revision',
    },
  };

  const status = statusConfig[submission.reviewStatus as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl p-6 border border-orange-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="text-2xl">{platformIcons[submission.platform as keyof typeof platformIcons]}</div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">{submission.title}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="capitalize">{submission.platform}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(submission.publishedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
          <StatusIcon className="h-4 w-4" />
          {status.label}
        </div>
      </div>

      {submission.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{submission.description}</p>
      )}

      {/* Metrics if available */}
      {submission.metrics && (
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          {submission.metrics.views && (
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {submission.metrics.views.toLocaleString()}
            </span>
          )}
          {submission.metrics.likes && (
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {submission.metrics.likes.toLocaleString()}
            </span>
          )}
          {submission.metrics.comments && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {submission.metrics.comments.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Review Notes */}
      {submission.reviewNotes && submission.reviewStatus === 'needs_revision' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">
            <span className="font-medium">Revision needed:</span> {submission.reviewNotes}
          </p>
        </div>
      )}

      <a
        href={submission.contentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
      >
        View Content
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}