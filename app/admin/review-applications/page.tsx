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
  X
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
  providerId: number;
  certificateHash: string;
  qrCodeData: string;
  fullName: string;
  serviceType: string;
  issuedDate: string;
  expiryDate: string;
  city: string;
  verificationScore: number;
}

export default function AdminDashboard() {
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

  // Load applications and statistics
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

  const approveApplication = async (applicationId: number) => {
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
        setShowCertificate(true);
      } else {
        console.error('Certificate generation failed:', result.message);
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
    }
  };

  const rejectApplication = async (applicationId: number, reason: string) => {
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
        // Update local state
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
    }
  };

  const viewDocuments = async (documentsHash: string) => {
    try {
      const response = await fetch(`/api/admin/documents/${documentsHash}`);
      const result = await response.json();
      
      if (result.success) {
        // Open documents in new window or download
        window.open(`/api/admin/download-documents/${documentsHash}`, '_blank');
      }
    } catch (error) {
      console.error('Error viewing documents:', error);
    }
  };

  const printCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && generatedCertificate) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tourism Provider Certificate</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; background: white; }
              .certificate { border: 3px solid #2563eb; padding: 40px; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); }
              .header { color: #1e40af; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .subheader { color: #64748b; font-size: 16px; margin-bottom: 30px; }
              .recipient { font-size: 24px; font-weight: bold; color: #1f2937; margin: 20px 0; }
              .details { text-align: left; margin: 30px 0; }
              .detail-row { margin: 10px 0; font-size: 14px; }
              .qr-code { margin: 20px auto; }
              .footer { margin-top: 40px; font-size: 12px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="certificate">
              <div class="header">TOURISM PROVIDER CERTIFICATE</div>
              <div class="subheader">Government Verified Tourism Service Provider</div>
              
              <div class="recipient">This certifies that</div>
              <div class="recipient" style="color: #2563eb;">${generatedCertificate.fullName}</div>
              
              <div class="details">
                <div class="detail-row"><strong>Provider ID:</strong> ${generatedCertificate.providerId}</div>
                <div class="detail-row"><strong>Service Type:</strong> ${generatedCertificate.serviceType}</div>
                <div class="detail-row"><strong>City:</strong> ${generatedCertificate.city}</div>
                <div class="detail-row"><strong>Verification Score:</strong> ${generatedCertificate.verificationScore}/100</div>
                <div class="detail-row"><strong>Issue Date:</strong> ${generatedCertificate.issuedDate}</div>
                <div class="detail-row"><strong>Expiry Date:</strong> ${generatedCertificate.expiryDate}</div>
                <div class="detail-row"><strong>Certificate Hash:</strong> ${generatedCertificate.certificateHash}</div>
              </div>
              
              <div class="qr-code">
                <div style="margin: 20px 0;">Scan QR Code to Verify</div>
                <div style="width: 120px; height: 120px; border: 1px solid #ccc; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: white;">
                  QR CODE
                </div>
              </div>
              
              <div class="footer">
                This certificate is digitally verified and stored on blockchain<br>
                Certificate verification: ${generatedCertificate.qrCodeData}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
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
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage tourism provider applications</p>
        </div>
        <Button onClick={loadDashboardData}>Refresh Data</Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalApplications}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Approvals</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.totalApprovals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rejections</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.totalRejections}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statistics.totalProviders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contract Balance</CardTitle>
              <div className="h-4 w-4 bg-purple-600 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parseFloat(statistics.contractBalance).toFixed(4)} MATIC</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
              <div className="h-4 w-4 bg-indigo-600 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parseFloat(statistics.totalFunding).toFixed(4)} MATIC</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="applications" className="w-full">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white min-w-32"
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
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{application.fullName}</h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Email: {application.email}</p>
                        <p>Phone: {application.phone}</p>
                        <p>City: {application.city}</p>
                        <p>Service Type: {application.vendorType}</p>
                        <p>Payment ID: {application.razorpayPaymentId}</p>
                        <p>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewDocuments(application.documentsHash)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Documents
                      </Button>
                      {application.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
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
          <Card>
            <CardHeader>
              <CardTitle>Provider Management</CardTitle>
              <CardDescription>Manage active tourism service providers</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Provider management features will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Management</CardTitle>
              <CardDescription>View and manage issued certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Certificate management features will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Review Application</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedApplication(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Name:</strong> {selectedApplication.fullName}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedApplication.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedApplication.phone}
                  </div>
                  <div>
                    <strong>City:</strong> {selectedApplication.city}
                  </div>
                  <div>
                    <strong>Service Type:</strong> {selectedApplication.vendorType}
                  </div>
                  <div>
                    <strong>Payment ID:</strong> {selectedApplication.razorpayPaymentId}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationScore">Verification Score (0-100)</Label>
                  <Input
                    id="verificationScore"
                    type="number"
                    min="0"
                    max="100"
                    value={verificationScore}
                    onChange={(e) => setVerificationScore(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationNotes">Verification Notes</Label>
                  <Textarea
                    id="verificationNotes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add verification notes..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => approveApplication(selectedApplication.applicationId)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setRejectionApplicationId(selectedApplication.applicationId);
                      setShowRejectionModal(true);
                    }}
                    className="flex-1"
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
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Reject Application</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectionModal(false);
                      setRejectionReason('');
                    }}
                    className="flex-1"
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
                    className="flex-1"
                    disabled={!rejectionReason.trim()}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Confirm Rejection
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Certificate Generated
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={printCertificate}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCertificate(false);
                      setGeneratedCertificate(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Certificate Preview */}
              <div className="border-4 border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 p-8 text-center rounded-lg">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-blue-800 mb-2">
                      TOURISM PROVIDER CERTIFICATE
                    </h1>
                    <p className="text-gray-600">Government Verified Tourism Service Provider</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-lg">This certifies that</p>
                    <p className="text-2xl font-bold text-blue-700">{generatedCertificate.fullName}</p>
                    <p className="text-lg">is an authorized {generatedCertificate.serviceType} provider</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-left bg-white p-6 rounded-lg shadow-inner">
                    <div className="space-y-2">
                      <p><strong>Provider ID:</strong> {generatedCertificate.providerId}</p>
                      <p><strong>Service Type:</strong> {generatedCertificate.serviceType}</p>
                      <p><strong>City:</strong> {generatedCertificate.city}</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>Verification Score:</strong> {generatedCertificate.verificationScore}/100</p>
                      <p><strong>Issue Date:</strong> {generatedCertificate.issuedDate}</p>
                      <p><strong>Expiry Date:</strong> {generatedCertificate.expiryDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                      <div className="w-24 h-24 border-2 border-gray-300 bg-white rounded-lg flex items-center justify-center mx-auto mb-2">
                        <QrCode className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-sm">Scan to Verify</p>
                    </div>
                    <div className="text-left text-xs text-gray-600 max-w-xs">
                      <p><strong>Certificate Hash:</strong></p>
                      <p className="font-mono break-all">{generatedCertificate.certificateHash}</p>
                      <p className="mt-2"><strong>Verification URL:</strong></p>
                      <p className="font-mono break-all">{generatedCertificate.qrCodeData}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 border-t pt-4">
                    This certificate is digitally verified and stored on blockchain<br/>
                    For verification, visit: {generatedCertificate.qrCodeData}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}