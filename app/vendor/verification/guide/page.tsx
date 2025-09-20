"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Upload, MapPin, Languages, Award, Phone, Mail, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import { 
  initializeRazorpayPayment, 
  PaymentConfigs, 
  RazorpayResponse 
} from "@/utils/razorpay";

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

export default function GuideVerification() {
  const { user } = useUser();
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

      console.log('Submitting application...');
      const response = await fetch('/api/submit-guide-application', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }

      setSubmitMessage({
        type: 'success',
        message: `Application submitted successfully! Application ID: ${result.applicationId}. You will receive updates via email.`
      });

      setFormData({
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
      setFiles({
        photo: null,
        idProof: null,
        certificates: null,
        experienceProof: null
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6" />
            Guide Verification Application
          </CardTitle>
          <CardDescription>
            Complete your profile to become a certified tourism guide. Registration fee: ₹100
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {submitMessage && (
            <Alert className={`mb-6 ${submitMessage.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
              <AlertDescription className={submitMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {submitMessage.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="panNumber">PAN Number *</Label>
                  <Input
                    id="panNumber"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value)}
                    placeholder="ABCDE1234F"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5" />
                Professional Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                    <SelectTrigger>
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
                  <Label htmlFor="experience">Experience (years) *</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your expertise and services..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="certifications">Certifications & Training</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  placeholder="List your relevant certifications..."
                />
              </div>
              
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Languages Spoken
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {languageOptions.map((language) => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox
                      id={language}
                      checked={formData.languages.includes(language)}
                      onCheckedChange={(checked) => handleLanguageChange(language, !!checked)}
                    />
                    <Label htmlFor={language}>{language}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Document Uploads
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="photo">Profile Photo *</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="idProof">ID Proof (Aadhar/Passport) *</Label>
                  <Input
                    id="idProof"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('idProof', e.target.files?.[0] || null)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="certificates">Certificates</Label>
                  <Input
                    id="certificates"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('certificates', e.target.files)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="experienceProof">Experience Proof</Label>
                  <Input
                    id="experienceProof"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('experienceProof', e.target.files)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', !!checked)}
                />
                <Label htmlFor="agreeToTerms">
                  I agree to the terms and conditions and privacy policy *
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !formData.agreeToTerms}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Payment & Submitting...
                  </>
                ) : (
                  'Pay ₹100 & Submit Application'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}