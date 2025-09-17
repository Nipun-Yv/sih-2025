"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, Upload, MapPin, Star, Wifi, Car, UtensilsCrossed } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { initializeRazorpayPayment,PaymentConfigs,RazorpayResponse } from "@/utils/razorpay";
interface FormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address: string;
  city: string;
  pincode: string;
  businessType: string;
  establishedYear: string;
  totalRooms: string;
  roomTypes: string[];
  priceRange: string;
  amenities: string[];
  description: string;
  websiteUrl: string;
  socialMediaLinks: string;
  operatingHours: string;
  cancellationPolicy: string;
  checkInTime: string;
  checkOutTime: string;
  gstNumber: string;
  panNumber: string;
  agreeToTerms: boolean;
}

interface Files {
  businessLicense: File | null;
  hotelPhotos: FileList | null;
  roomPhotos: FileList | null;
  menuCard: File | null;
  gstCertificate: File | null;
  panCard: File | null;
}

type FormDataKey = keyof FormData;
type FilesKey = keyof Files;

export default function HotelVerification() {
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    pincode: "",
    businessType: "",
    establishedYear: "",
    totalRooms: "",
    roomTypes: [],
    priceRange: "",
    amenities: [],
    description: "",
    websiteUrl: "",
    socialMediaLinks: "",
    operatingHours: "",
    cancellationPolicy: "",
    checkInTime: "",
    checkOutTime: "",
    gstNumber: "",
    panNumber: "",
    agreeToTerms: false
  });

  const [files, setFiles] = useState<Files>({
    businessLicense: null,
    hotelPhotos: null,
    roomPhotos: null,
    menuCard: null,
    gstCertificate: null,
    panCard: null
  });

  const businessTypes: string[] = [
    "Hotel", "Resort", "Homestay", "Guesthouse", "Lodge", "Hostel", "Heritage Property", "Eco Resort"
  ];

  const roomTypeOptions: string[] = [
    "Standard Rooms", "Deluxe Rooms", "Suite Rooms", "Family Rooms", "Dormitory", "Cottages", "Tents", "Tree House"
  ];

  const amenityOptions: string[] = [
    "Free WiFi", "Restaurant", "Room Service", "Parking", "Swimming Pool", "Gym/Fitness Center",
    "Spa Services", "Conference Rooms", "Airport Shuttle", "24/7 Front Desk", "Laundry Service",
    "Tour Desk", "Garden/Outdoor Space", "Balcony/Terrace", "Air Conditioning", "Heating",
    "Pet Friendly", "Wheelchair Accessible", "Currency Exchange", "Bicycle Rental"
  ];
  const {user}=useUser()
  const handleInputChange = (name: FormDataKey, value: string | boolean): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (fieldName: FormDataKey, option: string, checked: boolean): void => {
    if (checked) {
      setFormData(prev => ({ 
        ...prev, 
        [fieldName]: [...(prev[fieldName] as string[]), option] 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [fieldName]: (prev[fieldName] as string[]).filter(item => item !== option) 
      }));
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleFileChange = (fieldName: FilesKey, file: File | FileList | null): void => {
    setFiles(prev => ({ ...prev, [fieldName]: file }));
  };
  const processPayment = async (): Promise<RazorpayResponse> => {
    const paymentOptions = {
      ...PaymentConfigs.GUIDE_REGISTRATION,
      prefill: {
        name: formData.businessName,
        email: formData.email,
        contact: formData.phone,
      },
    };

    return await initializeRazorpayPayment(paymentOptions);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if(!formData.agreeToTerms){
      setSubmitMessage({type:'error',message:'Please agree to terms and conditions'})
    }
    if(!user){
      setSubmitMessage({type:'error',message:'Please log in to submit application'})
      return
    }
    setIsSubmitting(true);
    setSubmitMessage(null);
    try{
      console.log("Initialising payment")
      const paymentResponse=await processPayment()
      if(!paymentResponse.razorpay_payment_id){
        throw new Error('Payment not completed')
      }
      const submitData=new FormData();

    
      (Object.keys(formData) as FormDataKey[]).forEach(key => {
        const value = formData[key];
        if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value.toString());
        }
      });
      
      (Object.keys(files) as FilesKey[]).forEach(key => {
        const file = files[key];
        if (file) {
          if (file instanceof FileList) {
            Array.from(file).forEach((f, index) => {
              submitData.append(`${key}[${index}]`, f);
            });
          } else {
            submitData.append(key, file);
          }
        }
      });
    

    submitData.append('razorpayPaymentId', paymentResponse.razorpay_payment_id);
    if (paymentResponse.razorpay_order_id) {
      submitData.append('razorpayOrderId', paymentResponse.razorpay_order_id);
    }
    if (paymentResponse.razorpay_signature) {
      submitData.append('razorpaySignature', paymentResponse.razorpay_signature);
    }
    submitData.append('razorpayAmount', PaymentConfigs.GUIDE_REGISTRATION.amount.toString());
    submitData.append('userId', user.id);
    console.log('Submitting application')
    const response=await fetch('/api/submit-hotel-application',{
      method:'POST',
      body:submitData,
    });
    const result=await response.json();
    if(!response.ok){
      throw new Error(result.message || 'Submission failed')
    }
    console.log("Response in the frontend is ",response)
    setSubmitMessage({
      type:'success',
      message:`Application submitted successfully`
    });
    setFormData({
      businessName: "",
      ownerName: "",
      email: "",
      phone: "",
      alternatePhone: "",
      address: "",
      city: "",
      pincode: "",
      businessType: "",
      establishedYear: "",
      totalRooms: "",
      roomTypes: [],
      priceRange: "",
      amenities: [],
      description: "",
      websiteUrl: "",
      socialMediaLinks: "",
      operatingHours: "",
      cancellationPolicy: "",
      checkInTime: "",
      checkOutTime: "",
      gstNumber: "",
      panNumber: "",
      agreeToTerms: false
    });
  
    setFiles({
      businessLicense: null,
      hotelPhotos: null,
      roomPhotos: null,
      menuCard: null,
      gstCertificate: null,
      panCard: null
    });
    
    console.log("Food service verification submitted:", formData, files);
  }
  catch(error:any){
    console.error('Submission error:', error);
    setSubmitMessage({
      type: 'error',
      message: error || 'Failed to submit application. Please try again.'
    });
  }finally{
    setIsSubmitting(false);
  }
}


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hotel & Accommodation Verification</h1>
          <p className="text-gray-600">Register your property with Jharkhand Tourism</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Please provide complete and accurate information about your accommodation
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business/Property Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("businessName", e.target.value)}
                    placeholder="Enter property name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="ownerName">Owner/Manager Name *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("ownerName", e.target.value)}
                    placeholder="Enter owner name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select onValueChange={(value: string) => handleInputChange("businessType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type: string) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="establishedYear">Established Year *</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("establishedYear", e.target.value)}
                    placeholder="e.g., 2015"
                    min="1950"
                    max="2024"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                    placeholder="business@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Primary Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("phone", e.target.value)}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    type="tel"
                    value={formData.alternatePhone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("alternatePhone", e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("websiteUrl", e.target.value)}
                    placeholder="https://yourhotel.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("address", e.target.value)}
                  placeholder="Enter complete address with landmarks"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("city", e.target.value)}
                    placeholder="e.g., Ranchi, Jamshedpur"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="pincode">PIN Code *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("pincode", e.target.value)}
                    placeholder="834001"
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Property Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalRooms">Total Number of Rooms *</Label>
                    <Input
                      id="totalRooms"
                      type="number"
                      value={formData.totalRooms}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("totalRooms", e.target.value)}
                      placeholder="e.g., 25"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="priceRange">Price Range (per night) *</Label>
                    <Select onValueChange={(value: string) => handleInputChange("priceRange", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget (₹500-1500)</SelectItem>
                        <SelectItem value="mid-range">Mid-range (₹1500-3500)</SelectItem>
                        <SelectItem value="luxury">Luxury (₹3500-8000)</SelectItem>
                        <SelectItem value="premium">Premium (₹8000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="checkInTime">Check-in Time *</Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={formData.checkInTime}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("checkInTime", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="checkOutTime">Check-out Time *</Label>
                    <Input
                      id="checkOutTime"
                      type="time"
                      value={formData.checkOutTime}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("checkOutTime", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Room Types */}
              <div>
                <Label className="text-base font-medium">Room Types Available *</Label>
                <p className="text-sm text-gray-600 mb-3">Select all room types you offer</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roomTypeOptions.map((type: string) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.roomTypes.includes(type)}
                        onCheckedChange={(checked: boolean) => handleMultiSelectChange("roomTypes", type, checked)}
                      />
                      <Label htmlFor={type} className="text-sm font-normal">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <Label className="text-base font-medium">Amenities & Facilities</Label>
                <p className="text-sm text-gray-600 mb-3">Select all amenities available at your property</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-md p-3">
                  {amenityOptions.map((amenity: string) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked: boolean) => handleMultiSelectChange("amenities", amenity, checked)}
                      />
                      <Label htmlFor={amenity} className="text-sm font-normal">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Property Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your property, unique features, nearby attractions, etc."
                  required
                />
              </div>

              <div>
                <Label htmlFor="cancellationPolicy">Cancellation Policy *</Label>
                <Textarea
                  id="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("cancellationPolicy", e.target.value)}
                  placeholder="Explain your cancellation and refund policy"
                  required
                />
              </div>

              {/* Legal Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Legal & Tax Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("gstNumber", e.target.value)}
                      placeholder="GST registration number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="panNumber">PAN Number *</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("panNumber", e.target.value)}
                      placeholder="PAN card number"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Document & Photo Uploads
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessLicense">Business License *</Label>
                    <Input
                      id="businessLicense"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("businessLicense", e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="panCard">PAN Card Copy *</Label>
                    <Input
                      id="panCard"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("panCard", e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gstCertificate">GST Certificate (if applicable)</Label>
                    <Input
                      id="gstCertificate"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("gstCertificate", e.target.files?.[0] || null)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hotelPhotos">Property Photos *</Label>
                    <Input
                      id="hotelPhotos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("hotelPhotos", e.target.files)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="roomPhotos">Room Photos *</Label>
                    <Input
                      id="roomPhotos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("roomPhotos", e.target.files)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="menuCard">Menu Card (if restaurant available)</Label>
                    <Input
                      id="menuCard"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("menuCard", e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked: boolean) => handleInputChange("agreeToTerms", checked)}
                  required
                />
                <Label htmlFor="agreeToTerms" className="text-sm">
                  I agree to the terms and conditions, privacy policy, and verification guidelines *
                </Label>
              </div>

              <Alert>
                <AlertDescription>
                  Your property will be reviewed within 5-7 business days. A verification team may visit your property for final approval.
                </AlertDescription>
              </Alert>

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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}