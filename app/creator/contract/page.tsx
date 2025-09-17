// app/creator/contract/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Download, AlertCircle } from 'lucide-react';
import ContractViewer from '../components/ContractViewer';

export default function ContractPage() {
  const [creator, setCreator] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [isSigning, setIsSigning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const creatorRes = await fetch('/api/creator/init');
    const creatorData = await creatorRes.json();
    setCreator(creatorData.creator);

    // Generate or fetch contract
    if (creatorData.creator?.tier) {
      const contractRes = await fetch('/api/creator/contract');
      const contractData = await contractRes.json();
      setContract(contractData.contract);
    }
  };

  const handleSign = async () => {
    setIsSigning(true);
    try {
      const response = await fetch('/api/creator/contract/sign', {
        method: 'POST',
      });
      
      const data = await response.json();
      setContract(data.contract);
      
      // Update creator status
      await fetch('/api/creator/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'contract_signed' }),
      });

      // Show success message
      setTimeout(() => {
        router.push('/creator/submissions');
      }, 2000);
    } catch (error) {
      console.error('Failed to sign contract:', error);
    } finally {
      setIsSigning(false);
    }
  };

  if (!creator?.tier) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 border border-orange-100 text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Contract Available
          </h3>
          <p className="text-gray-600 mb-6">
            Complete analytics to receive your contract
          </p>
          <Button 
            onClick={() => router.push('/creator/analytics')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Go to Analytics
          </Button>
        </div>
      </div>
    );
  }

  const isSigned = contract?.status === 'signed';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Creator Contract</h1>
        <p className="text-gray-600 mt-2">
          Review and sign your agreement with Jharkhand Tourism
        </p>
      </div>

      {isSigned ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Contract Signed Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            Signed on {new Date(contract.signedAt).toLocaleDateString()}
          </p>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Copy
          </Button>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contract Document */}
        <div className="lg:col-span-2">
          <ContractViewer contract={contract} creator={creator} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Terms Summary */}
          <div className="bg-white rounded-xl p-6 border border-orange-100">
            <h3 className="font-semibold text-gray-900 mb-4">Key Terms</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Trip Duration:</span>
                <p className="text-gray-600">{contract?.terms?.tripDuration} days, all expenses paid</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Compensation:</span>
                <p className="text-gray-600">
                  {contract?.terms?.compensation > 0 
                    ? `₹${contract.terms.compensation.toLocaleString()}`
                    : 'Trip expenses only'
                  }
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Content Requirements:</span>
                <ul className="text-gray-600 mt-1 space-y-1">
                  {contract?.terms?.contentRequirements?.map((req: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isSigned && (
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <h4 className="font-semibold text-gray-900 mb-3">Ready to sign?</h4>
              <p className="text-sm text-gray-600 mb-4">
                By signing, you agree to the terms and conditions outlined in the contract.
              </p>
              <Button
                onClick={handleSign}
                disabled={isSigning}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSigning ? 'Signing...' : 'Sign Contract'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}