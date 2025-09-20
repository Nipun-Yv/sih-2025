'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  Eye,
  Download,
  Search,
  Filter,
  Award,
  QrCode,
  Printer,
  X,
  Camera,
  CreditCard,
  ExternalLink
} from 'lucide-react';

interface Application {
  id: number;
  applicationId: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  vendorType: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  razorpayPaymentId: string;
  documentsHash: string;
  applicationDataHash: string;
  panHash: string;
  photo?: string;
  gstNumber?: string;
}

interface Statistics {
  totalApplications: number;
  totalApprovals: number;
  totalRejections: number;
  totalProviders: number;
  contractBalance: string;
  totalFunding: string;
}

interface Certificate {
  id: string;
  certificateNumber: string;
  certificateHash: string;
  ipfsHash: string;
  qrCodeData: string;
  fullName: string;
  serviceType: string;
  issuedDate: string;
  expiryDate: string;
  city: string;
  verificationScore: number;
  downloadUrl: string;
  verificationUrl: string;
}

export default function AdminDashboard() {
  const [isApproving,setIsApproving]=useState(false);
  const [isRejecting,setIsRejecting]=useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationScore, setVerificationScore] = useState(80);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCertificate, setShowCertificate] = useState(false);
  const [generatedCertificate, setGeneratedCertificate] = useState<Certificate | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionApplicationId, setRejectionApplicationId] = useState<number | null>(null);
  const [certificateContent, setCertificateContent] = useState<any>(null);
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  
  const [showDocuments, setShowDocuments] = useState(false);
  const [documentsData, setDocumentsData] = useState<any>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [loadingDocuments, setLoadingDocuments] = useState<number|null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const appsResponse = await fetch('/api/admin/applications');
      const appsData = await appsResponse.json();
      console.log("APPsdata is ",appsData);
      setApplications(appsData.applications || []);

      const statsResponse = await fetch('/api/admin/statistics');
      const statsData = await statsResponse.json();
      setStatistics(statsData.statistics || null);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewDocuments = async (documentsHash: string, applicationDataHash: string,applicationId:number) => {
    setLoadingDocuments(applicationId);
    try {
      const docsResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${documentsHash}`);
      const docsData = await docsResponse.json();
      
      const appResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${applicationDataHash}`);
      const appData = await appResponse.json();
      
      setDocumentsData(docsData);
      setApplicationData(appData);
      setShowDocuments(true);
      
    } catch (error) {
      console.error('Error viewing documents:', error);
      alert('Failed to load documents. Please try again.');
    } finally {
      setLoadingDocuments(null);
    }
  };

  const getDocumentUrl = (hash: string) => {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  };

  const openDocument = (hash: string, fileName: string) => {
    const url = getDocumentUrl(hash);
    window.open(url, '_blank');
  };

  const fetchCertificateFromIPFS = async (ipfsHash: string) => {
    setLoadingCertificate(true);
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      console.log("Response is ",response)
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const certificateData = await response.json();
          setCertificateContent(certificateData);
        } else {
          const certificateHTML = await response.text();
          setCertificateContent({ html: certificateHTML });
        }
      } else {
        console.error('Failed to fetch certificate from IPFS');
        setCertificateContent(null);
      }
    } catch (error) {
      console.error('Error fetching certificate from IPFS:', error);
      setCertificateContent(null);
    } finally {
      setLoadingCertificate(false);
    }
  };

  const approveApplication = async (applicationId: number) => {
    setIsApproving(true);
    try {
      const response = await fetch('/api/admin/approve-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          verifierNotes: verificationNotes,
          verificationScore,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setApplications(prev =>
          prev.map(app =>
            app.applicationId === applicationId
              ? { ...app, status: 'approved' as const }
              : app
          )
        );
        console.log("result in the frontend is",result);
        await generateCertificate(result.providerId);
        
        setSelectedApplication(null);
        setVerificationNotes('');
        alert(`Application approved! Provider ID: ${result.providerId}`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to approve application');
    }finally{
      setIsApproving(false);
    }
  };

  const generateCertificate = async (providerId: number) => {
    try {
      const response = await fetch('/api/admin/generate-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providerId }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedCertificate(result.certificate);
        await fetchCertificateFromIPFS(result.certificate.ipfsHash);
        setShowCertificate(true);
      } else {
        console.error('Certificate generation failed:', result.message);
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
    }
  };

  const rejectApplication = async (applicationId: number, reason: string) => {
    setIsRejecting(true);
    try {
      const response = await fetch('/api/admin/reject-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          reason,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setApplications(prev =>
          prev.map(app =>
            app.applicationId === applicationId
              ? { ...app, status: 'rejected' as const }
              : app
          )
        );
        setSelectedApplication(null);
        setShowRejectionModal(false);
        setRejectionReason('');
        alert('Application rejected');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Rejection error:', error);
      alert('Failed to reject application');
    }finally{
      setIsRejecting(false);
    }
  };

  const renderVendorInfo = (application: Application) => {
    const vendorType = application.vendorType?.toUpperCase();
    
    if (vendorType === 'GUIDE' && application.photo) {
      return (
        <div className="flex items-center text-sm text-orange-700 mt-1">
          <Camera className="w-4 h-4 mr-1" />
          <span>Photo: </span>
          <img 
            src={`https://gateway.pinata.cloud/ipfs/${application.photo}`} 
            alt="Provider Photo"
            className="w-6 h-6 rounded-full object-cover ml-2 border border-orange-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    } else if (vendorType === 'TRANSPORT' && application.gstNumber) {
      return (
        <p className="text-sm text-orange-700">
          <FileText className="w-4 h-4 inline mr-1" />
          License: {application.gstNumber}
        </p>
      );
    } else if (vendorType && vendorType !== 'GUIDE' && vendorType !== 'TRANSPORT' && application.gstNumber) {
      return (
        <p className="text-sm text-orange-700">
          <CreditCard className="w-4 h-4 inline mr-1" />
          GST: {application.gstNumber}
        </p>
      );
    }
    
    return null;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-700 border-green-400 bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-700 border-red-400 bg-red-50"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-lg text-orange-700">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-orange-800">Admin Dashboard</h1>
            <p className="text-orange-600">Manage tourism provider applications</p>
          </div>
          <Button 
            onClick={loadDashboardData}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Refresh Data
          </Button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-orange-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-800">{statistics.totalApplications}</div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Approvals</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{statistics.totalApprovals}</div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Total Rejections</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{statistics.totalRejections}</div>
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Active Providers</CardTitle>
                <Users className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">{statistics.totalProviders}</div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Contract Balance</CardTitle>
                <div className="h-4 w-4 bg-orange-500 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-800">{parseFloat(statistics.contractBalance).toFixed(4)} MATIC</div>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-700">Total Funding</CardTitle>
                <div className="h-4 w-4 bg-yellow-500 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">{parseFloat(statistics.totalFunding).toFixed(4)} MATIC</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="bg-orange-100 border-orange-200">
            <TabsTrigger value="applications" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Applications</TabsTrigger>
            <TabsTrigger value="providers" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Providers</TabsTrigger>
            <TabsTrigger value="certificates" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-md bg-white min-w-32 focus:border-orange-400 focus:ring-orange-400"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Applications List */}
            <div className="grid gap-4">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="border-orange-200 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:border-orange-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-orange-800">{application.fullName}</h3>
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="text-sm text-orange-700 space-y-1">
                          <p>Email: {application.email}</p>
                          <p>Service Type: {application.vendorType}</p>
                          <p>Payment ID: {application.razorpayPaymentId}</p>
                          <p>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</p>
                          {renderVendorInfo(application)}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDocuments(application.documentsHash, application.applicationDataHash,application.applicationId)}
                          disabled={loadingDocuments===application.applicationId}
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {loadingDocuments===application.applicationId ? 'Loading...' : 'View Application and Documents'}
                        </Button>
                        {application.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                            className="border-orange-300 text-orange-700 hover:bg-orange-50"
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="providers">
            <Card className="border-orange-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-orange-800">Provider Management</CardTitle>
                <CardDescription className="text-orange-600">Manage active tourism service providers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700">Provider management features will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card className="border-orange-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-orange-800">Certificate Management</CardTitle>
                <CardDescription className="text-orange-600">View and manage issued certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700">Certificate management features will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Documents Viewer Modal */}
        {showDocuments && documentsData && applicationData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-orange-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-orange-600" />
                    Application Documents & Data
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDocuments(false);
                      setDocumentsData(null);
                      setApplicationData(null);
                    }}
                    className="text-orange-600 hover:bg-orange-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Application Data Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-orange-700 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Application Information
                    </h3>
                    
                    <div className="bg-orange-50 rounded-lg p-4 space-y-3 border border-orange-200">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <span className="text-sm font-medium text-orange-600">Vendor Type:</span>
                          <p className="font-semibold text-orange-800">{applicationData.vendorType}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-orange-600">Submitted At:</span>
                          <p className="font-semibold text-orange-800">{new Date(applicationData.submittedAt).toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-orange-600">Version:</span>
                          <p className="font-semibold text-orange-800">{applicationData.version}</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Data */}
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-3">Personal Information</h4>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        {Object.entries(applicationData.formData || {}).map(([key, value]) => (
                          <div key={key} className="border-b border-orange-200 pb-2">
                            <span className="text-orange-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                            </span>
                            <div className="mt-1">
                              {Array.isArray(value) ? (
                                <div className="flex flex-wrap gap-1">
                                  {value.map((item, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="font-semibold text-orange-900">{String(value)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-orange-700 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Uploaded Documents
                    </h3>
                    
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="mb-3">
                        <span className="text-sm font-medium text-orange-600">Upload Timestamp:</span>
                        <p className="font-semibold text-orange-800">{new Date(documentsData.uploadedAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(documentsData.documents || {}).map(([category, files]) => (
                        <div key={category} className="bg-white border border-orange-200 rounded-lg p-4">
                          <h4 className="font-semibold text-orange-800 mb-3 capitalize flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-orange-600" />
                            {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h4>
                          
                          <div className="space-y-2">
                            {Array.isArray(files) && files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-100">
                                <div className="flex-1">
                                  <p className="font-medium text-orange-900">{file.originalName}</p>
                                  <div className="flex items-center gap-4 text-xs text-orange-600 mt-1">
                                    <span>Type: {file.type}</span>
                                    <span>Size: {(file.size / 1024).toFixed(1)} KB</span>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  {file.type.startsWith('image/') ? (
                                    <div className="flex gap-2">
                                      <img
                                        src={getDocumentUrl(file.hash)}
                                        alt={file.originalName}
                                        className="w-12 h-12 object-cover rounded border border-orange-200 cursor-pointer hover:opacity-80"
                                        onClick={() => openDocument(file.hash, file.originalName)}
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openDocument(file.hash, file.originalName)}
                                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openDocument(file.hash, file.originalName)}
                                      className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                                    >
                                      <FileText className="w-4 h-4" />
                                      Open PDF
                                    </Button>
                                  )}
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        const response = await fetch(getDocumentUrl(file.hash));
                                        const blob = await response.blob();
                                        const url = URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = file.originalName;
                                        link.click();
                                        URL.revokeObjectURL(url);
                                      } catch (error) {
                                        console.error('Download failed:', error);
                                      }
                                    }}
                                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-orange-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const links:unknown[] = [];
                      Object.entries(documentsData.documents || {}).forEach(([category, files]) => {
                        if (Array.isArray(files)) {
                          files.forEach(file => {
                            links.push(`${category}: ${file.originalName} - ${getDocumentUrl(file.hash)}`);
                          });
                        }
                      });
                      
                      const content = `Application Documents\n\nApplication Data:\n${JSON.stringify(applicationData, null, 2)}\n\nDocument Links:\n${links.join('\n')}`;
                      
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `application_${applicationData.formData?.fullName || 'data'}_${new Date().toISOString().split('T')[0]}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Summary
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-orange-800">Review Application</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedApplication(null)}
                    className="text-orange-600 hover:bg-orange-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div>
                      <strong className="text-orange-700">Name:</strong> 
                      <span className="text-orange-800 ml-1">{selectedApplication.fullName}</span>
                    </div>
                    <div>
                      <strong className="text-orange-700">Email:</strong> 
                      <span className="text-orange-800 ml-1">{selectedApplication.email}</span>
                    </div>
                    <div>
                      <strong className="text-orange-700">Service Type:</strong> 
                      <span className="text-orange-800 ml-1">{selectedApplication.vendorType}</span>
                    </div>
                    <div>
                      <strong className="text-orange-700">Payment ID:</strong> 
                      <span className="text-orange-800 ml-1">{selectedApplication.razorpayPaymentId}</span>
                    </div>
                  </div>

                  {/* Show vendor-specific info in review modal */}
                  {selectedApplication.vendorType?.toUpperCase() === 'GUIDE' && selectedApplication.photo && (
                    <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                      <h4 className="font-semibold mb-2 flex items-center text-orange-800">
                        <Camera className="w-4 h-4 mr-2" />
                        Guide Photo
                      </h4>
                      <img 
                        src={`https://gateway.pinata.cloud/ipfs/${selectedApplication.photo}`} 
                        alt="Guide Photo"
                        className="w-24 h-24 rounded-lg object-cover border border-orange-200"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-avatar.png';
                        }}
                      />
                    </div>
                  )}

                  {selectedApplication.gstNumber && (
                    <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                      <h4 className="font-semibold mb-2 flex items-center text-orange-800">
                        {selectedApplication.vendorType?.toUpperCase() === 'TRANSPORT' ? (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            License Number
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            GST Number
                          </>
                        )}
                      </h4>
                      <p className="font-mono text-sm text-orange-800">{selectedApplication.gstNumber}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="verificationScore" className="text-orange-700">Verification Score (0-100)</Label>
                    <Input
                      id="verificationScore"
                      type="number"
                      min="0"
                      max="100"
                      value={verificationScore}
                      onChange={(e) => setVerificationScore(Number(e.target.value))}
                      className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verificationNotes" className="text-orange-700">Verification Notes</Label>
                    <Textarea
                      id="verificationNotes"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="Add verification notes..."
                      rows={3}
                      className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => approveApplication(selectedApplication.applicationId)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={isApproving || isRejecting}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isApproving ? 'Approving Application...' : 'Approve Application'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setRejectionApplicationId(selectedApplication.applicationId);
                        setShowRejectionModal(true);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={isApproving || isRejecting}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-orange-800">Reject Application</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowRejectionModal(false);
                      setRejectionReason('');
                    }}
                    className="text-orange-600 hover:bg-orange-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason" className="text-orange-700">Rejection Reason</Label>
                    <Textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      rows={4}
                      className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectionModal(false);
                        setRejectionReason('');
                      }}
                      className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (rejectionApplicationId && rejectionReason.trim()) {
                          rejectApplication(rejectionApplicationId, rejectionReason);
                        }
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={!rejectionReason.trim() || isRejecting}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Display Modal */}
        {showCertificate && generatedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center text-orange-800">
                    <Award className="w-5 h-5 mr-2 text-orange-600" />
                    Certificate Generated Successfully
                  </h2>
                  <div className="flex gap-2">
                   
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCertificate(false);
                        setGeneratedCertificate(null);
                        setCertificateContent(null);
                      }}
                      className="text-orange-600 hover:bg-orange-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(generatedCertificate.downloadUrl, '_blank')}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      View Generated Certificate
                    </Button>
                  <Button
                    onClick={() => window.open(generatedCertificate.verificationUrl, '_blank')}
                    className="flex items-center bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Verify Online
                  </Button>
                  
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}