'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Plus, 
  Link as LinkIcon, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import ContentSubmissionCard from '../components/ContentSubmissionCard';
import NotificationToast from '../components/NotificationToast';

export default function SubmissionsPage() {
  const [creator, setCreator] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<any>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    platform: 'youtube',
    contentUrl: '',
    title: '',
    description: '',
    publishedAt: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch creator data
      const creatorRes = await fetch('/api/creator/init');
      const creatorData = await creatorRes.json();
      setCreator(creatorData.creator);

      // Fetch contract
      const contractRes = await fetch('/api/creator/contract');
      const contractData = await contractRes.json();
      setContract(contractData.contract);

      // Fetch submissions
      const submissionsRes = await fetch('/api/creator/submissions');
      const submissionsData = await submissionsRes.json();
      setSubmissions(submissionsData.submissions || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/creator/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      const data = await response.json();
      setSubmissions([data.submission, ...submissions]);
      setShowForm(false);
      setFormData({
        platform: 'youtube',
        contentUrl: '',
        title: '',
        description: '',
        publishedAt: new Date().toISOString().split('T')[0],
      });

      setNotification({
        type: 'success',
        message: 'Content submitted successfully!',
      });

      // Check if all requirements met
      if (data.allRequirementsMet) {
        await fetch('/api/creator/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'content_submitted' }),
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to submit content',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRequiredContent = () => {
    if (!contract?.terms?.contentRequirements) return [];
    return contract.terms.contentRequirements;
  };

  const getSubmissionProgress = () => {
    const required = getRequiredContent();
    const submitted = submissions.filter(s => s.reviewStatus !== 'needs_revision').length;
    return { submitted, total: required.length };
  };

  const progress = getSubmissionProgress();
  const canSubmit = creator?.status === 'contract_signed';

  if (!canSubmit) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 border border-orange-100 text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Contract Required
          </h3>
          <p className="text-gray-600 mb-6">
            Please sign your contract before submitting content
          </p>
          <Button 
            onClick={() => router.push('/creator/contract')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            View Contract
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Submissions</h1>
        <p className="text-gray-600 mt-2">
          Track and submit your content for the Jharkhand tourism campaign
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl p-6 border border-orange-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Submission Progress</h3>
          <span className="text-sm font-medium text-orange-600">
            {progress.submitted} of {progress.total} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(progress.submitted / progress.total) * 100}%` }}
          />
        </div>
        
        {/* Requirements List */}
        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">Content Requirements:</p>
          {getRequiredContent().map((req: string, idx: number) => (
            <div key={idx} className="flex items-start gap-3 text-sm">
              <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                idx < progress.submitted ? 'text-green-500' : 'text-gray-300'
              }`} />
              <span className={idx < progress.submitted ? 'text-gray-700' : 'text-gray-500'}>
                {req}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Content Button */}
      <div className="flex justify-end mb-6">
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          Submit New Content
        </Button>
      </div>

      {/* Submission Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 border border-orange-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Content</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="blog">Blog</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="publishedAt">Published Date</Label>
                <Input
                  id="publishedAt"
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contentUrl">Content URL</Label>
              <div className="relative mt-1">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="contentUrl"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  className="pl-10"
                  value={formData.contentUrl}
                  onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="My Jharkhand Adventure - Day 1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your content..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Upload className="h-5 w-5 mr-2 animate-pulse" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Submit Content
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length > 0 ? (
          submissions.map((submission) => (
            <ContentSubmissionCard 
              key={submission._id} 
              submission={submission} 
            />
          ))
        ) : (
          <div className="bg-white rounded-xl p-8 border border-orange-100 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No content submitted yet</p>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}              