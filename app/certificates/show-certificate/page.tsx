'use client'
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Eye, Loader2, AlertCircle, XCircle, Award, X, Download, ExternalLink } from 'lucide-react';

// Types
interface Certificate {
  _id: string;
  certificateNumber: string;
  serviceType: string;
  fullName: string;
  issuedDate: string;
  expiryDate: string;
  ipfsHash: string;
  isActive: boolean;
  city: string;
  verificationScore: number;
}

// Client Component
const CertificateViewer = () => {
  const { user, isLoaded } = useUser();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string>('');
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchLatestCertificate();
    }
  }, [isLoaded, user]);

  const fetchLatestCertificate = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/find-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch certificate');
      }

      setCertificate(data.certificate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const viewCertificate = async () => {
    if (!certificate) return;

    setLoadingCertificate(true);
    
    try {
      // Construct IPFS URL - you might need to adjust this based on your IPFS gateway
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}`;
      // Alternative gateways:
      // const ipfsUrl = `https://ipfs.io/ipfs/${certificate.ipfsHash}`;
      // const ipfsUrl = `https://cloudflare-ipfs.com/ipfs/${certificate.ipfsHash}`;
      
      setCertificateUrl(ipfsUrl);
      setShowModal(true);
    } catch (err) {
      setError('Failed to load certificate from IPFS');
    } finally {
      setLoadingCertificate(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificate) return;
    
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}`;
    const link = document.createElement('a');
    link.href = ipfsUrl;
    link.download = `${certificate.certificateNumber}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your certificate...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view your certificates.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Certificate</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLatestCertificate}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No certificate found
  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Certificate Found</h2>
          <p className="text-gray-600">You don't have any valid certificates at the moment.</p>
        </div>
      </div>
    );
  }

  const expired = isExpired(certificate.expiryDate);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Latest Certificate</h1>
            <p className="text-gray-600">Most recent valid certificate on record</p>
          </div>

          {/* Certificate Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">{certificate.serviceType}</h2>
                  <p className="text-orange-100 text-sm">Certificate No: {certificate.certificateNumber}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  certificate.isActive && !expired 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {certificate.isActive && !expired ? 'Valid' : (expired ? 'Expired' : 'Inactive')}
                </div>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Holder Name</p>
                    <p className="font-medium text-gray-800">{certificate.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">City</p>
                    <p className="font-medium text-gray-800">{certificate.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Issue Date</p>
                    <p className="font-medium text-gray-800">{formatDate(certificate.issuedDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Expiry Date</p>
                    <p className={`font-medium ${expired ? 'text-red-600' : 'text-gray-800'}`}>
                      {formatDate(certificate.expiryDate)}
                    </p>
                  </div>
                </div>

                {/* Verification Score */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Verification Score</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${certificate.verificationScore}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {certificate.verificationScore}%
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={viewCertificate}
                    disabled={loadingCertificate}
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loadingCertificate ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    View Certificate
                  </button>
                  
                  <button
                    onClick={downloadCertificate}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="text-center mt-6">
            <button
              onClick={fetchLatestCertificate}
              disabled={loading}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh Certificate'}
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Certificate: {certificate.certificateNumber}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-700 p-1"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-4">
              {certificateUrl ? (
                <iframe
                  src={certificateUrl}
                  className="w-full h-full min-h-[600px] border rounded"
                  title="Certificate Document"
                  onError={() => setError('Failed to load certificate document')}
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={downloadCertificate}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificateViewer;