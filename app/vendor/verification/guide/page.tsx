"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Upload, MapPin, Languages, Award, Phone, Mail, Loader2, CheckCircle, Clock, XCircle, Download, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import { 
  initializeRazorpayPayment, 
  PaymentConfigs, 
  RazorpayResponse 
} from "@/utils/razorpay";
import { TourismPlatformService, VendorType } from "@/utils/secure-transactions-utils";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  experience: string;
  specialization: string;
  languages: string[];
  certifications: string;
  description: string;
  emergencyContact: string;
  panNumber: string;
  agreeToTerms: boolean;
};

type Files = {
  photo: File | null;
  idProof: File | null;
  certificates: FileList | null;
  experienceProof: FileList | null;
};

interface GuideRegistrationResponse {
  success: boolean;
  applicationId: string;
  vendorId?: number;
  blockchainTxHash?: string;
  explorerUrl?: string;
  registrationFee?: number;
  message: string;
}

type ApplicationStatus = 'pending' | 'approved' | 'complete' | 'suspended' | 'rejected' | 'incomplete';

interface ApplicationStatusResponse {
  exists: boolean;
  status?: ApplicationStatus;
  applicationId?: string;
  submissionDate?: string;
  message: string;
}

export default function GuideVerification() {
  const { user } = useUser();
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatusResponse | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: user?.emailAddresses[0]?.emailAddress || "",
    phone: "",
    address: "",
    city: "",
    state: "Jharkhand",
    experience: "",
    specialization: "",
    languages: [],
    certifications: "",
    description: "",
    emergencyContact: "",
    panNumber: "",
    agreeToTerms: false,
  });

  const [files, setFiles] = useState<Files>({
    photo: null,
    idProof: null,
    certificates: null,
    experienceProof: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const languageOptions = [
    "Hindi", "English", "Santhali", "Ho", "Mundari", "Kurukh", "Kharia", "Bengali", "Urdu"
  ];

  const specializationOptions = [
    "Wildlife & Nature", "Cultural Heritage", "Adventure Sports", "Tribal Culture",
    "Historical Sites", "Eco-tourism", "Photography", "Trekking & Hiking"
  ];

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
    }
  }, [user]);

  const checkApplicationStatus = async () => {
    if (!user) return;
    
    setIsCheckingStatus(true);
    try {

      setTimeout(() => {
        setApplicationStatus({
          exists: false, 
          message: "No previous application found"
        });
        setIsCheckingStatus(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error checking application status:', error);
      setApplicationStatus({
        exists: false,
        message: "Error checking application status"
      });
      setIsCheckingStatus(false);
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'approved':
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'suspended':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'incomplete':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return {
          title: "Application Under Review",
          message: "Your application is currently being reviewed by our team. You will receive updates via email.",
          color: "border-orange-200 bg-orange-50"
        };
      case 'approved':
      case 'complete':
        return {
          title: "Congratulations! You're Verified",
          message: "Your application has been approved. You can now download your certificate.",
          color: "border-green-200 bg-green-50"
        };
      case 'rejected':
        return {
          title: "Application Rejected",
          message: "Your application has been rejected. Please review the requirements and apply again.",
          color: "border-red-200 bg-red-50"
        };
      case 'suspended':
        return {
          title: "Application Suspended",
          message: "Your application is currently suspended. Please contact support for more information.",
          color: "border-yellow-200 bg-yellow-50"
        };
      case 'incomplete':
        return {
          title: "Application Incomplete",
          message: "Your previous application was incomplete. Please fill out all required information.",
          color: "border-orange-200 bg-orange-50"
        };
      default:
        return null;
    }
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        languages: prev.languages.filter(lang => lang !== language)
      }));
    }
  };

  const handleInputChange = (name: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (fieldName: keyof Files, file: File | FileList | null) => {
    setFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  const processPayment = async (): Promise<RazorpayResponse> => {
    const paymentOptions = {
      ...PaymentConfigs.GUIDE_REGISTRATION,
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
    };

    return await initializeRazorpayPayment(paymentOptions);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setSubmitMessage({ type: 'error', message: 'Please agree to terms and conditions' });
      return;
    }

    if (!user) {
      setSubmitMessage({ type: 'error', message: 'Please log in to submit application' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      console.log('Initiating payment...');
      const paymentResponse = await processPayment();

      if (!paymentResponse.razorpay_payment_id) {
        throw new Error('Payment not completed');
      }

      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "languages") {
          submitData.append(key, JSON.stringify(value));
        } else if (key !== "agreeToTerms") {
          submitData.append(key, String(value));
        }
      });

      if (files.photo) {
        submitData.append('photo', files.photo);
      }
      if (files.idProof) {
        submitData.append('idProof', files.idProof);
      }
      if (files.certificates && files.certificates.length > 0) {
        Array.from(files.certificates).forEach(file => {
          submitData.append('certificates', file);
        });
      }
      if (files.experienceProof && files.experienceProof.length > 0) {
        Array.from(files.experienceProof).forEach(file => {
          submitData.append('experienceProof', file);
        });
      }

      submitData.append('razorpayPaymentId', paymentResponse.razorpay_payment_id);
      if (paymentResponse.razorpay_order_id) {
        submitData.append('razorpayOrderId', paymentResponse.razorpay_order_id);
      }
      if (paymentResponse.razorpay_signature) {
        submitData.append('razorpaySignature', paymentResponse.razorpay_signature);
      }
      submitData.append('razorpayAmount', PaymentConfigs.GUIDE_REGISTRATION.amount.toString());
      submitData.append('userId', user.id);

      console.log('Submitting application with blockchain integration ...');
      const response = await fetch('/api/submit-guide-application', {
        method: 'POST',
        body: submitData,
      });

      const result: GuideRegistrationResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }
      
      let successMessage = `Application submitted successfully! Application Id: ${result.applicationId}`;
      if (result.vendorId) {
        successMessage += ` Vendor ID: ${result.vendorId}`;
      }
      if (result.blockchainTxHash) {
        successMessage += ` Transaction recorded on blockchain: ${result.blockchainTxHash}`;
      }
      if (result.explorerUrl) {
        successMessage += ` View on explorer: ${result.explorerUrl}`;
      }
      successMessage += ' You will receive updates via email';
      
      setSubmitMessage({
        type: 'success',
        message: successMessage
      });

    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmitMessage({
        type: 'error',
        message: error.message || 'Failed to submit application. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-orange-200">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">Checking your application status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (applicationStatus?.exists && applicationStatus.status) {
    const statusInfo = getStatusMessage(applicationStatus.status);
    
    if (applicationStatus.status === 'pending') {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <Card className={`border-2 ${statusInfo?.color}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-orange-800">
                {getStatusIcon(applicationStatus.status)}
                {statusInfo?.title}
              </CardTitle>
              <CardDescription className="text-orange-700">
                Application ID: {applicationStatus.applicationId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="border-orange-200 bg-orange-50">
                <Clock className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-800">
                  {statusInfo?.message}
                </AlertDescription>
              </Alert>
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (applicationStatus.status === 'approved' || applicationStatus.status === 'complete') {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <Card className={`border-2 ${statusInfo?.color}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-800">
                {getStatusIcon(applicationStatus.status)}
                {statusInfo?.title}
              </CardTitle>
              <CardDescription className="text-green-700">
                Application ID: {applicationStatus.applicationId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="border-green-200 bg-green-50 mb-6">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-800">
                  {statusInfo?.message}
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => window.location.href = '/certificates'}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-2 border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
          <CardTitle className="flex items-center gap-3 text-orange-800">
            <div className="p-2 bg-orange-500 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            Guide Verification Application
          </CardTitle>
          <CardDescription className="text-orange-700">
            Complete your profile to become a certified tourism guide. Registration fee: ₹100
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {submitMessage && (
            <Alert className={`mb-6 border-2 ${
              submitMessage.type === 'success' 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <AlertDescription className={
                submitMessage.type === 'success' 
                  ? 'text-green-800' 
                  : 'text-red-800'
              }>
                {submitMessage.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-orange-200">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-orange-800">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="panNumber" className="text-gray-700 font-medium">PAN Number *</Label>
                  <Input
                    id="panNumber"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value)}
                    placeholder="ABCDE1234F"
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-orange-200">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-orange-800">Location Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-gray-700 font-medium">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="city" className="text-gray-700 font-medium">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state" className="text-gray-700 font-medium">State</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-orange-200">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-orange-800">Professional Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization" className="text-gray-700 font-medium">Specialization *</Label>
                  <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                    <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializationOptions.map((spec) => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="experience" className="text-gray-700 font-medium">Experience (years) *</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your expertise and services..."
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="certifications" className="text-gray-700 font-medium">Certifications & Training</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  placeholder="List your relevant certifications..."
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>
              
              <div>
                <Label htmlFor="emergencyContact" className="text-gray-700 font-medium">Emergency Contact *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  required
                />
              </div>
            </div>

            {/* Languages Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-orange-200">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Languages className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-orange-800">Languages Spoken</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {languageOptions.map((language) => (
                  <div key={language} className="flex items-center space-x-2 p-2 rounded-lg border border-orange-200 hover:bg-orange-50">
                    <Checkbox
                      id={language}
                      checked={formData.languages.includes(language)}
                      onCheckedChange={(checked) => handleLanguageChange(language, !!checked)}
                      className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <Label htmlFor={language} className="text-gray-700 font-medium cursor-pointer">{language}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Uploads Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-orange-200">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Upload className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-orange-800">Document Uploads</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="photo" className="text-gray-700 font-medium">Profile Photo *</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)}
                    className="border-orange-200 focus:border-orange-400 file:bg-orange-50 file:text-orange-700 file:border-orange-200"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="idProof" className="text-gray-700 font-medium">ID Proof (Aadhar/Passport) *</Label>
                  <Input
                    id="idProof"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('idProof', e.target.files?.[0] || null)}
                    className="border-orange-200 focus:border-orange-400 file:bg-orange-50 file:text-orange-700 file:border-orange-200"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="certificates" className="text-gray-700 font-medium">Certificates</Label>
                  <Input
                    id="certificates"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('certificates', e.target.files)}
                    className="border-orange-200 focus:border-orange-400 file:bg-orange-50 file:text-orange-700 file:border-orange-200"
                  />
                </div>
                
                <div>
                  <Label htmlFor="experienceProof" className="text-gray-700 font-medium">Experience Proof</Label>
                  <Input
                    id="experienceProof"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('experienceProof', e.target.files)}
                    className="border-orange-200 focus:border-orange-400 file:bg-orange-50 file:text-orange-700 file:border-orange-200"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Submit Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-orange-200 bg-orange-50">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', !!checked)}
                  className="border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label htmlFor="agreeToTerms" className="text-orange-800 font-medium cursor-pointer">
                  I agree to the terms and conditions and privacy policy *
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-3 bg-amber-500 hover:bg-orange-600 text-white font-semibold text-lg shadow-lg"
                disabled={isSubmitting || !formData.agreeToTerms}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Processing Payment & Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-3" />
                    Pay ₹100 & Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}