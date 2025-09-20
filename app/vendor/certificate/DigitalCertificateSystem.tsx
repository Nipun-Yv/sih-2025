"use client";
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Shield, 
  QrCode, 
  Download, 
  Share2, 
  Eye, 
  CheckCircle,
  MapPin,
  Calendar,
  User,
  Car,
  Home,
  Utensils,
  Star,
  Phone,
  Mail,
  Globe,
  Printer
} from 'lucide-react';

// Certificate types and data structures
interface BaseCertificate {
  id: string;
  type: 'guide' | 'transport' | 'accommodation' | 'restaurant';
  providerName: string;
  businessName?: string;
  certificateNumber: string;
  issueDate: string;
  validUntil: string;
  verificationStatus: 'verified' | 'pending' | 'expired';
  blockchainHash: string;
  qrCode: string;
  location: string;
  contact: {
    phone: string;
    email: string;
  };
  verifiedBy: string;
  rating?: number;
}

interface GuideCertificate extends BaseCertificate {
  type: 'guide';
  languages: string[];
  specializations: string[];
  experience: string;
  certifications: string[];
  licenseNumber?: string;
}

interface TransportCertificate extends BaseCertificate {
  type: 'transport';
  serviceType: string;
  vehicleTypes: string[];
  operatingAreas: string[];
  licenseNumber: string;
  insuranceValid: boolean;
  vehicleCount: number;
}

interface AccommodationCertificate extends BaseCertificate {
  type: 'accommodation';
  propertyType: string;
  roomCount: number;
  amenities: string[];
  starRating: number;
  priceRange: string;
}

interface RestaurantCertificate extends BaseCertificate {
  type: 'restaurant';
  cuisineTypes: string[];
  capacity: number;
  specialties: string[];
  foodSafetyRating: string;
  priceRange: string;
}

type Certificate = GuideCertificate | TransportCertificate | AccommodationCertificate | RestaurantCertificate;

// Mock certificate data
const mockCertificates: Certificate[] = [
  {
    id: 'CERT-G-001',
    type: 'guide',
    providerName: 'Rahul Kumar',
    certificateNumber: 'JH-GUIDE-2024-001',
    issueDate: '2024-01-15',
    validUntil: '2025-01-15',
    verificationStatus: 'verified',
    blockchainHash: '0x1a2b3c4d5e6f7890abcdef1234567890',
    qrCode: 'QR_CODE_DATA_HERE',
    location: 'Ranchi, Jharkhand',
    contact: {
      phone: '+91 9876543210',
      email: 'rahul@email.com'
    },
    verifiedBy: 'Jharkhand Tourism Authority',
    rating: 4.8,
    languages: ['Hindi', 'English', 'Bengali'],
    specializations: ['Cultural Tours', 'Adventure Tours', 'Historical Sites'],
    experience: '5 years',
    certifications: ['First Aid Certificate', 'Tourism Guide Certificate'],
    licenseNumber: 'TG123456'
  },
  {
    id: 'CERT-T-001',
    type: 'transport',
    providerName: 'Suresh Travels',
    businessName: 'Suresh Transport Services',
    certificateNumber: 'JH-TRANSPORT-2024-001',
    issueDate: '2024-01-16',
    validUntil: '2025-01-16',
    verificationStatus: 'verified',
    blockchainHash: '0x2b3c4d5e6f7890abcdef1234567890ab',
    qrCode: 'QR_CODE_DATA_HERE',
    location: 'Ranchi, Jharkhand',
    contact: {
      phone: '+91 9876543212',
      email: 'suresh@travels.com'
    },
    verifiedBy: 'Jharkhand Transport Authority',
    rating: 4.5,
    serviceType: 'Taxi & Car Rental',
    vehicleTypes: ['Sedan', 'SUV', 'Hatchback'],
    operatingAreas: ['Ranchi', 'Dhanbad', 'Jamshedpur'],
    licenseNumber: 'TL123456',
    insuranceValid: true,
    vehicleCount: 8
  },
  {
    id: 'CERT-A-001',
    type: 'accommodation',
    providerName: 'Paradise Inn',
    businessName: 'Hotel Paradise',
    certificateNumber: 'JH-HOTEL-2024-001',
    issueDate: '2024-01-17',
    validUntil: '2025-01-17',
    verificationStatus: 'verified',
    blockchainHash: '0x3c4d5e6f7890abcdef1234567890abcd',
    qrCode: 'QR_CODE_DATA_HERE',
    location: 'Deoghar, Jharkhand',
    contact: {
      phone: '+91 9876543213',
      email: 'paradise@hotel.com'
    },
    verifiedBy: 'Jharkhand Tourism Authority',
    rating: 4.2,
    propertyType: 'Hotel',
    roomCount: 25,
    amenities: ['WiFi', 'AC', 'Restaurant', 'Parking', 'Room Service'],
    starRating: 3,
    priceRange: '₹2000-5000 per night'
  },
  {
    id: 'CERT-R-001',
    type: 'restaurant',
    providerName: 'Traditional Kitchen',
    businessName: 'Jharkhand Flavors',
    certificateNumber: 'JH-RESTAURANT-2024-001',
    issueDate: '2024-01-18',
    validUntil: '2025-01-18',
    verificationStatus: 'verified',
    blockchainHash: '0x4d5e6f7890abcdef1234567890abcdef',
    qrCode: 'QR_CODE_DATA_HERE',
    location: 'Hazaribagh, Jharkhand',
    contact: {
      phone: '+91 9876543214',
      email: 'flavors@restaurant.com'
    },
    verifiedBy: 'Jharkhand Food Safety Authority',
    rating: 4.6,
    cuisineTypes: ['Indian', 'Regional Jharkhand', 'Tribal Cuisine'],
    capacity: 50,
    specialties: ['Traditional Tribal Dishes', 'Local Delicacies', 'Organic Ingredients'],
    foodSafetyRating: 'A+',
    priceRange: '₹200-800 per person'
  }
];

const DigitalCertificationSystem: React.FC = () => {
  const [selectedCert, setSelectedCert] = useState<Certificate>(mockCertificates[0]);
  const [viewMode, setViewMode] = useState<'certificate' | 'verification' | 'qr'>('certificate');
  const certificateRef = useRef<HTMLDivElement>(null);

  const getCertificateIcon = (type: string) => {
    const icons = {
      guide: User,
      transport: Car,
      accommodation: Home,
      restaurant: Utensils
    };
    return icons[type as keyof typeof icons] || User;
  };

  const getCertificateColor = (type: string) => {
    const colors = {
      guide: 'from-blue-600 to-blue-800',
      transport: 'from-green-600 to-green-800',
      accommodation: 'from-purple-600 to-purple-800',
      restaurant: 'from-orange-600 to-orange-800'
    };
    return colors[type as keyof typeof colors] || 'from-gray-600 to-gray-800';
  };

  const downloadCertificate = () => {
    window.print();
  };

  const shareCertificate = async () => {
    const shareData = {
      title: `${selectedCert.providerName} - Verified Service Provider`,
      text: `Verified ${selectedCert.type} service provider in Jharkhand Tourism Platform`,
      url: `https://jharkhand-tourism.com/verify/${selectedCert.certificateNumber}`
    };
    
    try {
      await navigator.share(shareData);
    } catch (err) {
      navigator.clipboard.writeText(shareData.url);
      alert('Certificate link copied to clipboard!');
    }
  };

  const renderCertificateView = () => (
    <div ref={certificateRef} className="w-full max-w-4xl mx-auto">
      {/* Certificate Design */}
      <div className={`relative bg-gradient-to-br ${getCertificateColor(selectedCert.type)} p-8 rounded-2xl shadow-2xl text-white overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-24 translate-y-24"></div>
        </div>
        
        {/* Header */}
        <div className="relative z-10 text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-16 w-16 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Jharkhand Tourism Platform</h1>
              <p className="text-xl opacity-90">Digital Service Provider Certificate</p>
            </div>
          </div>
          <div className="w-24 h-1 bg-white mx-auto rounded-full"></div>
        </div>

        {/* Certificate Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Provider Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold mb-2">{selectedCert.providerName}</h2>
              {selectedCert.businessName && (
                <p className="text-2xl opacity-90 mb-4">{selectedCert.businessName}</p>
              )}
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                {React.createElement(getCertificateIcon(selectedCert.type), { className: "h-8 w-8" })}
                <span className="text-xl capitalize">{selectedCert.type} Service Provider</span>
              </div>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Service Details</h3>
                <div className="space-y-2 text-sm">
                  {selectedCert.type === 'guide' && (
                    <>
                      <p><strong>Languages:</strong> {(selectedCert as GuideCertificate).languages.join(', ')}</p>
                      <p><strong>Specializations:</strong> {(selectedCert as GuideCertificate).specializations.join(', ')}</p>
                      <p><strong>Experience:</strong> {(selectedCert as GuideCertificate).experience}</p>
                    </>
                  )}
                  {selectedCert.type === 'transport' && (
                    <>
                      <p><strong>Service Type:</strong> {(selectedCert as TransportCertificate).serviceType}</p>
                      <p><strong>Vehicle Types:</strong> {(selectedCert as TransportCertificate).vehicleTypes.join(', ')}</p>
                      <p><strong>Operating Areas:</strong> {(selectedCert as TransportCertificate).operatingAreas.join(', ')}</p>
                    </>
                  )}
                  {selectedCert.type === 'accommodation' && (
                    <>
                      <p><strong>Property Type:</strong> {(selectedCert as AccommodationCertificate).propertyType}</p>
                      <p><strong>Rooms:</strong> {(selectedCert as AccommodationCertificate).roomCount}</p>
                      <p><strong>Amenities:</strong> {(selectedCert as AccommodationCertificate).amenities.join(', ')}</p>
                    </>
                  )}
                  {selectedCert.type === 'restaurant' && (
                    <>
                      <p><strong>Cuisine:</strong> {(selectedCert as RestaurantCertificate).cuisineTypes.join(', ')}</p>
                      <p><strong>Specialties:</strong> {(selectedCert as RestaurantCertificate).specialties.join(', ')}</p>
                      <p><strong>Food Safety:</strong> {(selectedCert as RestaurantCertificate).foodSafetyRating}</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Contact & Location</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedCert.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {selectedCert.contact.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedCert.contact.email}
                  </p>
                  {selectedCert.rating && (
                    <p className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {selectedCert.rating} / 5.0
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - QR & Verification */}
          <div className="text-center space-y-6">
            <div className="bg-white p-6 rounded-xl text-gray-800">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                <QrCode className="h-16 w-16" />
              </div>
              <p className="text-xs font-medium">Scan to Verify</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Verified Provider</span>
              </div>
              <p className="text-xs opacity-90">Certificate ID:</p>
              <p className="text-sm font-mono bg-black bg-opacity-20 px-3 py-1 rounded">
                {selectedCert.certificateNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white border-opacity-30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center md:text-left">
              <p><strong>Issue Date:</strong></p>
              <p>{new Date(selectedCert.issueDate).toLocaleDateString()}</p>
            </div>
            <div className="text-center">
              <p><strong>Valid Until:</strong></p>
              <p>{new Date(selectedCert.validUntil).toLocaleDateString()}</p>
            </div>
            <div className="text-center md:text-right">
              <p><strong>Verified By:</strong></p>
              <p>{selectedCert.verifiedBy}</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs opacity-75">
              This certificate is secured by blockchain technology. Hash: {selectedCert.blockchainHash.substring(0, 20)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVerificationView = () => (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Certificate Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
              <CheckCircle className="h-5 w-5 mr-2" />
              VERIFIED
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Certificate Number:</strong>
              <p className="font-mono bg-gray-50 p-2 rounded mt-1">{selectedCert.certificateNumber}</p>
            </div>
            <div>
              <strong>Blockchain Hash:</strong>
              <p className="font-mono bg-gray-50 p-2 rounded mt-1 text-xs break-all">
                {selectedCert.blockchainHash}
              </p>
            </div>
            <div>
              <strong>Issue Date:</strong>
              <p className="mt-1">{new Date(selectedCert.issueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <strong>Valid Until:</strong>
              <p className="mt-1">{new Date(selectedCert.validUntil).toLocaleDateString()}</p>
            </div>
            <div>
              <strong>Status:</strong>
              <Badge className="mt-1 bg-green-100 text-green-800">
                {selectedCert.verificationStatus.toUpperCase()}
              </Badge>
            </div>
            <div>
              <strong>Verified By:</strong>
              <p className="mt-1">{selectedCert.verifiedBy}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Verification Details</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Identity Verified
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Documents Authenticated
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Background Check Completed
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Compliance Verified
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Blockchain Record Created
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQRView = () => (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>QR Code Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
            <QrCode className="h-32 w-32" />
          </div>
          
          <div className="space-y-2">
            <p className="font-semibold">{selectedCert.providerName}</p>
            <p className="text-sm text-gray-600">{selectedCert.certificateNumber}</p>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Verified
            </Badge>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>Scan this QR code to verify authenticity</p>
            <p>Powered by blockchain technology</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Service Provider Certificates</h1>
          <p className="text-gray-600">Blockchain-secured certificates for verified service providers</p>
        </div>

        {/* Certificate Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockCertificates.map((cert) => {
                const Icon = getCertificateIcon(cert.type);
                return (
                  <Button
                    key={cert.id}
                    variant={selectedCert.id === cert.id ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => setSelectedCert(cert)}
                  >
                    <Icon className="h-8 w-8" />
                    <div className="text-center">
                      <p className="font-medium">{cert.providerName}</p>
                      <p className="text-xs capitalize">{cert.type}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* View Mode Selector */}
        <div className="mb-8 flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'certificate' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('certificate')}
              className="flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              Certificate
            </Button>
            <Button
              variant={viewMode === 'verification' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('verification')}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Verification
            </Button>
            <Button
              variant={viewMode === 'qr' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('qr')}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </div>
        </div>

        {/* Certificate Actions */}
        <div className="mb-8 flex justify-center gap-4">
          <Button onClick={downloadCertificate} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download/Print
          </Button>
          <Button variant="outline" onClick={shareCertificate} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Public Profile
          </Button>
        </div>

        {/* Certificate Display */}
        <div className="mb-8">
          {viewMode === 'certificate' && renderCertificateView()}
          {viewMode === 'verification' && renderVerificationView()}
          {viewMode === 'qr' && renderQRView()}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Blockchain Secured</h3>
              <p className="text-sm text-gray-600">
                Each certificate is secured with blockchain technology, ensuring authenticity and preventing fraud.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <QrCode className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">QR Code Verification</h3>
              <p className="text-sm text-gray-600">
                Instant verification through QR code scanning, accessible to tourists and authorities.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Official Recognition</h3>
              <p className="text-sm text-gray-600">
                Officially recognized by Jharkhand Tourism Authority and government departments.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DigitalCertificationSystem;