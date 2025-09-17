import React, { useState, useEffect } from 'react';
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
  Download
} from 'lucide-react';

interface CertificateData {
  providerId: number;
  fullName: string;
  serviceType: string;
  city: string;
  issuedDate: string;
  expiryDate: string;
  verificationScore: number;
  isValid: boolean;
  isExpired: boolean;
}

interface VerificationPageProps {
  certificateHash?: string;
}

export default function CertificateVerification({ certificateHash }: VerificationPageProps) {
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState(certificateHash || '');

  useEffect(() => {
    if (certificateHash) {
      verifyCertificate(certificateHash);
    } else {
      setIsLoading(false);
    }
  }, [certificateHash]);

  const verifyCertificate = async (hashToVerify: string) => {
    if (!hashToVerify.trim()) {
      setError('Please enter a certificate hash');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/verify-certificate/${hashToVerify}`);
      const result = await response.json();

      if (result.success) {
        setCertificate(result.certificate);
      } else {
        setError(result.message || 'Certificate not found');
        setCertificate(null);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify certificate. Please try again.');
      setCertificate(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerification = () => {
    if (hash.trim()) {
      verifyCertificate(hash.trim());
    }
  };

  const getValidityStatus = () => {
    if (!certificate) return null;

    if (certificate.isExpired) {
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        text: 'Expired',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      };
    }

    if (certificate.isValid) {
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
    if (score >= 80) return { color: 'bg-blue-500', text: 'Very Good' };
    if (score >= 70) return { color: 'bg-yellow-500', text: 'Good' };
    return { color: 'bg-red-500', text: 'Average' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Certificate Verification</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Verify the authenticity of tourism provider certificates
          </p>
        </div>

        {!certificateHash && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Verify Certificate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter certificate hash or scan QR code"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualVerification()}
                />
                <Button 
                  onClick={handleManualVerification}
                  disabled={!hash.trim() || isLoading}
                  className="px-6"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying certificate...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-3" />
                <div>
                  <h3 className="font-semibold">Verification Failed</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {certificate && !isLoading && (
          <div className="space-y-6">
            <Card className={`${getValidityStatus()?.borderColor} ${getValidityStatus()?.bgColor}`}>
              <CardContent className="p-6">
                <div className={`flex items-center justify-center ${getValidityStatus()?.textColor}`}>
                  {getValidityStatus()?.icon}
                  <span className="text-2xl font-bold ml-3">
                    Certificate {getValidityStatus()?.text}
                  </span>
                </div>
                {certificate.isExpired && (
                  <p className="text-center mt-2 text-red-600">
                    This certificate expired on {certificate.expiryDate}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Tourism Provider Certificate</h2>
                    <p className="text-blue-100">Government Verified Service Provider</p>
                  </div>
                  <Award className="w-16 h-16 text-blue-200" />
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Provider Information</h3>
                    
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-semibold text-lg">{certificate.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Service Type</p>
                        <p className="font-semibold">{certificate.serviceType}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="font-semibold">{certificate.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Provider ID</p>
                        <p className="font-semibold">#{certificate.providerId}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Certificate Details</h3>
                    
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Issue Date</p>
                        <p className="font-semibold">{certificate.issuedDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Expiry Date</p>
                        <p className="font-semibold">{certificate.expiryDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Verification Score</p>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{certificate.verificationScore}/100</span>
                          <Badge className={`${getScoreBadge(certificate.verificationScore).color} text-white`}>
                            {getScoreBadge(certificate.verificationScore).text}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-2">Certificate Hash</p>
                      <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                        {certificateHash || hash}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Trust & Security</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                      <div>
                        <p className="font-semibold text-green-700">Blockchain Verified</p>
                        <p className="text-xs text-green-600">Immutable record</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-500 mr-3" />
                      <div>
                        <p className="font-semibold text-blue-700">Government Approved</p>
                        <p className="text-xs text-blue-600">Official certification</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <Award className="w-6 h-6 text-purple-500 mr-3" />
                      <div>
                        <p className="font-semibold text-purple-700">Quality Assured</p>
                        <p className="text-xs text-purple-600">Verified standards</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => window.print()}
                    className="flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Print Certificate
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const url = window.location.href;
                      navigator.clipboard.writeText(url);
                      alert('Verification link copied to clipboard!');
                    }}
                  >
                    Share Verification Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {certificate.isExpired && (
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