'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Award, 
  MapPin, 
  Calendar,
  User,
  AlertCircle,
  Shield,
  Download,
  ExternalLink,
  Globe,
  ArrowLeft,
  CreditCard,
  FileText,
  Camera,
  Hash,
  Eye
} from 'lucide-react';

interface CertificateData {
  certificateNumber: string;
  certificateHash: string;
  fullName: string;
  serviceType: string;
  city: string;
  issuedDate: string;
  expiryDate: string;
  verificationScore: number;
  providerId: string | number;
  downloadUrl: string;
  verificationUrl: string;
  transactionHash: string;
  blockchainTxUrl: string;
  vendorType?: string;
  photo?: string;        
  gstNumber?: string;  
}

interface BlockchainVerification {
  isValid: boolean;
  certificateNumber: string;
  issuedDate: string;
  expiryDate: string;
}

interface VerificationResponse {
  success: boolean;
  verified: boolean;
  certificate: CertificateData;
  panHash?: string;
  blockchainVerification?: BlockchainVerification;
  message?: string;
}

export default function CertificateVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const certificateHash = params?.hash as string;
  
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certificateHash) {
      verifyCertificate(certificateHash);
    } else {
      setError('No certificate hash provided in URL');
      setIsLoading(false);
    }
  }, [certificateHash]);

  const verifyCertificate = async (hash: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/verify-certificate/${hash}`);
      const result: VerificationResponse = await response.json();
      console.log("Result for the certificate verificiation [art",result)
      if (result.success && result.verified) {
        setVerificationData(result);
        document.title = `Certificate Verification - ${result.certificate.fullName}`;
      } else {
        setError(result.message || 'Certificate not found or invalid');
        setVerificationData(null);
        document.title = 'Certificate Not Found';
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify certificate. Please check the URL and try again.');
      setVerificationData(null);
      document.title = 'Certificate Verification Error';
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = () => {
    if (!verificationData?.certificate) return false;
    const expiryDate = new Date(verificationData.certificate.expiryDate);
    const currentDate = new Date();
    return expiryDate < currentDate;
  };

  const getValidityStatus = () => {
    if (!verificationData) return null;

    const expired = isExpired();

    if (expired) {
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        text: 'Expired',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      };
    }

    if (verificationData.verified) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: 'Valid',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      };
    }

    return {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      text: 'Invalid',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    };
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { color: 'bg-green-500', text: 'Excellent' };
    if (score >= 80) return { color: 'bg-orange-500', text: 'Very Good' };
    if (score >= 70) return { color: 'bg-yellow-500', text: 'Good' };
    return { color: 'bg-red-500', text: 'Average' };
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const copyVerificationLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Verification link copied to clipboard!');
  };

  const copyTransactionHash = () => {
    if (verificationData?.certificate.transactionHash) {
      navigator.clipboard.writeText(verificationData.certificate.transactionHash);
      alert('Transaction hash copied to clipboard!');
    }
  };

  const renderVendorSpecificInfo = () => {
    if (!verificationData?.certificate) return null;

    const { vendorType, photo, gstNumber } = verificationData.certificate;
    const type = vendorType?.toUpperCase();

    if (type === 'GUIDE' && photo) {
      return (
        <div className="flex items-center">
          <Camera className="w-5 h-5 text-orange-400 mr-3" />
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm text-gray-500">Provider Photo (Please Verify this on the certificate of Vendor)</p>
              <p className="font-semibold">Verified Photo ID (Please Verify this on the certificate of Vendor)</p>
            </div>
            <img 
              src={`https://gateway.pinata.cloud/ipfs/${photo}`} 
              alt="Provider Photo"
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      );
    } else if (type === 'TRANSPORT' && gstNumber) {
      return (
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-orange-400 mr-3" />
          <div>
            <p className="text-sm text-gray-500">License Number (Please Verify this on the certificate of Vendor)</p>
            <p className="font-semibold">{gstNumber}</p>
          </div>
        </div>
      );
    } else if (type && type !== 'GUIDE' && type !== 'TRANSPORT' && gstNumber) {
      return (
        <div className="flex items-center">
          <CreditCard className="w-5 h-5 text-orange-400 mr-3" />
          <div>
            <p className="text-sm text-gray-500">GST Number (Please Verify this on the certificate of Vendor)</p>
            <p className="font-semibold">{gstNumber}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mr-4 hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-orange-600 mr-2" />
              <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
            </div>
            <p className="text-gray-600">
              Instant verification for certificate hash: 
              <code className="ml-2 px-2 py-1 bg-orange-100 rounded text-sm">
                {certificateHash?.substring(0, 16)}...
              </code>
            </p>
          </div>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Verifying Certificate</h3>
              <p className="text-gray-600">Please wait while we verify the certificate...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center text-red-700 mb-4">
                <AlertCircle className="w-6 h-6 mr-3" />
                <div>
                  <h3 className="font-semibold text-lg">Verification Failed</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-orange-300 hover:bg-orange-50"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => router.push('/verification')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Verify Another Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {verificationData && !isLoading && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card className={`${getValidityStatus()?.borderColor} ${getValidityStatus()?.bgColor}`}>
              <CardContent className="p-6">
                <div className={`flex items-center justify-center ${getValidityStatus()?.textColor}`}>
                  {getValidityStatus()?.icon}
                  <span className="text-2xl font-bold ml-3">
                    Certificate {getValidityStatus()?.text}
                  </span>
                </div>
                {isExpired() && (
                  <p className="text-center mt-2 text-red-600">
                    This certificate expired on {formatDate(verificationData.certificate.expiryDate)}
                  </p>
                )}
                <div className="text-center mt-3">
                  <p className="text-sm opacity-75">
                    Verified on {new Date().toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Main Certificate Card */}
            <Card className="overflow-hidden">
              <div className="bg-orange-300 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Tourism Provider Certificate</h2>
                    <p className="text-orange-100">Government Verified Service Provider</p>
                    <p className="text-orange-200 text-sm mt-1">
                      Certificate #{verificationData.certificate.certificateNumber}
                    </p>
                  </div>
                  <Award className="w-16 h-16 text-orange-200" />
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Provider Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-orange-200 pb-2 text-orange-800">Provider Information</h3>
                    
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-orange-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-semibold text-lg">{verificationData.certificate.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-orange-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Service Type</p>
                        <p className="font-semibold">{verificationData.certificate.serviceType}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-orange-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="font-semibold">{verificationData.certificate.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-orange-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Provider ID</p>
                        <p className="font-semibold">#{verificationData.certificate.providerId}</p>
                      </div>
                    </div>

                    {/* 🔹 Add vendor-specific information */}
                    {renderVendorSpecificInfo()}
                  </div>

                  {/* Certificate Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-orange-200 pb-2 text-orange-800">Certificate Details</h3>
                    
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-orange-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Issue Date</p>
                        <p className="font-semibold">{formatDate(verificationData.certificate.issuedDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-orange-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Expiry Date</p>
                        <p className="font-semibold">{formatDate(verificationData.certificate.expiryDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-orange-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Verification Score</p>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{verificationData.certificate.verificationScore}/100</span>
                          <Badge className={`${getScoreBadge(verificationData.certificate.verificationScore).color} text-white`}>
                            {getScoreBadge(verificationData.certificate.verificationScore).text}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-2">Certificate Hash</p>
                      <p className="font-mono text-xs bg-orange-50 p-2 rounded break-all border border-orange-200">
                        {verificationData.certificate.certificateHash}
                      </p>
                    </div>
                  </div>
                </div>

                {verificationData.certificate.transactionHash && (
                  <div className="mt-6 pt-6 border-t border-orange-200">
                    <h3 className="text-lg font-semibold mb-4 text-orange-800">Blockchain Transaction</h3>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Hash className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-sm bg-white p-2 rounded border break-all flex-1">
                                {verificationData.certificate.transactionHash}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={copyTransactionHash}
                                className="border-orange-300 hover:bg-orange-100 text-orange-700"
                              >
                                Copy
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {verificationData.certificate.blockchainTxUrl && (
                          <div className="flex items-center">
                            <Eye className="w-5 h-5 text-orange-600 mr-3" />
                            <Button
                              variant="outline"
                              onClick={() => window.open(verificationData.certificate.blockchainTxUrl, '_blank')}
                              className="border-orange-300 hover:bg-orange-100 text-orange-700"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View on Explorer
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Trust & Security Section */}
                <div className="mt-8 pt-6 border-t border-orange-200">
                  <h3 className="text-lg font-semibold mb-4 text-orange-800">Trust & Security</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                      <div>
                        <p className="font-semibold text-green-700">
                          {verificationData.blockchainVerification?.isValid ? 'Blockchain Verified' : 'Database Verified'}
                        </p>
                        <p className="text-xs text-green-600">
                          {verificationData.blockchainVerification?.isValid ? 'Immutable record' : 'Official database'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <Shield className="w-6 h-6 text-orange-500 mr-3" />
                      <div>
                        <p className="font-semibold text-orange-700">Government Approved</p>
                        <p className="text-xs text-orange-600">Official certification</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                      <Award className="w-6 h-6 text-amber-500 mr-3" />
                      <div>
                        <p className="font-semibold text-amber-700">Quality Assured</p>
                        <p className="text-xs text-amber-600">Verified standards</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Information */}
                {verificationData.panHash && (
                  <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold mb-2 flex items-center text-orange-800">
                      <Globe className="w-4 h-4 mr-2" />
                      Blockchain Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">PAN Hash: </span>
                        <span className="font-mono">{verificationData.panHash.substring(0, 20)}...</span>
                      </div>
                      {verificationData.blockchainVerification && (
                        <div>
                          <span className="text-gray-500">Blockchain Status: </span>
                          <Badge className={verificationData.blockchainVerification.isValid ? 'bg-green-500' : 'bg-red-500'}>
                            {verificationData.blockchainVerification.isValid ? 'Verified' : 'Not Found'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-orange-200">
                  
                  {verificationData.certificate.downloadUrl && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(verificationData.certificate.downloadUrl, '_blank')}
                      className="flex items-center border-orange-300 hover:bg-orange-50 text-orange-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View PDF
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={copyVerificationLink}
                    className="flex items-center border-orange-300 hover:bg-orange-50 text-orange-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Copy Verification Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Expiry Warning */}
            {isExpired() && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center text-amber-700">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    <div>
                      <h4 className="font-semibold">Expired Certificate</h4>
                      <p className="text-sm mt-1">
                        This certificate has expired and may no longer be valid for tourism services. 
                        Please contact the provider for updated certification.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            This verification system is powered by blockchain technology to ensure 
            authenticity and prevent fraud.
          </p>
          <p className="mt-2">
            For support or questions, please contact the tourism authority.
          </p>
        </div>
      </div>
    </div>
  );
}