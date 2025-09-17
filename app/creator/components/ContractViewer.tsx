'use client';

import { FileText } from 'lucide-react';

interface ContractViewerProps {
  contract: any;
  creator: any;
}

export default function ContractViewer({ contract, creator }: ContractViewerProps) {
  const today = new Date().toLocaleDateString();
  
  return (
    <div className="bg-white rounded-xl border border-orange-100 p-8 min-h-[600px]">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-900">Content Creation Agreement</h2>
      </div>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">
          This Content Creation Agreement ("Agreement") is entered into on {today} between
          Jharkhand Tourism Board ("Client") and <span className="font-semibold">{creator?.channelData?.name || 'Creator'}</span> ("Creator").
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">1. Scope of Work</h3>
        <p className="text-gray-600 mb-4">
          The Creator agrees to produce and publish authentic content showcasing Jharkhand's 
          tourism experiences across their social media platforms.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">2. Deliverables</h3>
        <ul className="space-y-2 text-gray-600 mb-4">
          {contract?.terms?.contentRequirements?.map((req: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>{req}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">3. Compensation</h3>
        <p className="text-gray-600 mb-4">
          The Client agrees to provide:
        </p>
        <ul className="space-y-2 text-gray-600 mb-4">
          <li>• {contract?.terms?.tripDuration}-day all-expenses-paid trip to Jharkhand</li>
          {contract?.terms?.compensation > 0 && (
            <li>• Additional compensation of ₹{contract?.terms?.compensation?.toLocaleString()}</li>
          )}
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">4. Content Rights</h3>
        <p className="text-gray-600 mb-4">
          The Creator retains ownership of all content created. The Client receives a 
          perpetual, non-exclusive license to use the content for tourism promotion.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">5. Timeline</h3>
        <p className="text-gray-600 mb-4">
          Content must be published within 30 days of trip completion.
        </p>

        {contract?.status === 'signed' && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              Digitally signed on {new Date(contract.signedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}