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
import { UtensilsCrossed, Upload, MapPin, Clock, Users, Shield } from "lucide-react";
import { initializeRazorpayPayment,PaymentConfigs,RazorpayResponse } from "@/utils/razorpay";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
interface FormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address: string;
  city: string;
  businessType: string;
  establishedYear: string;
  cuisineTypes: string[];
  specialties: string;
  seatingCapacity: string;
  operatingHours: string;
  deliveryService: boolean;
  takeawayService: boolean;
  cateringService: boolean;
  onlineOrdering: boolean;
  facilities: string[];
  hygieneRating: string;
  staffCount: string;
  chefExperience: string;
  averageMealPrice: string;
  description: string;
  foodSafetyLicense: string;
  gstNumber: string;
  panNumber: string;
  specialDiets: string[];
  paymentMethods: string[];
  agreeToTerms: boolean;
}

interface Files {
  businessLicense: File | null;
  foodSafetyLicense: File | null;
  kitchenPhotos: FileList | null;
  restaurantPhotos: FileList | null;
  menuCard: FileList | null;
  gstCertificate: File | null;
  panCard: File | null;
  hygieneCredentials: FileList | null;
}

type FormDataKey = keyof FormData;
type FilesKey = keyof Files;

export default function FoodVerification() {
  const {user}=useUser();
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    businessType: "",
    establishedYear: "",
    cuisineTypes: [],
    specialties: "",
    seatingCapacity: "",
    operatingHours: "",
    deliveryService: false,
    takeawayService: false,
    cateringService: false,
    onlineOrdering: false,
    facilities: [],
    hygieneRating: "",
    staffCount: "",
    chefExperience: "",
    averageMealPrice: "",
    description: "",
    foodSafetyLicense: "",
    gstNumber: "",
    panNumber: "",
    specialDiets: [],
    paymentMethods: [],
    agreeToTerms: false
  });

  const [files, setFiles] = useState<Files>({
    businessLicense: null,
    foodSafetyLicense: null,
    kitchenPhotos: null,
    restaurantPhotos: null,
    menuCard: null,
    gstCertificate: null,
    panCard: null,
    hygieneCredentials: null
  });

  const businessTypes: string[] = [
    "Restaurant", "Dhaba", "Cafe", "Fast Food", "Street Food Vendor", 
    "Catering Service", "Food Truck", "Sweet Shop", "Bakery", "Traditional Cuisine"
  ];

  const cuisineOptions: string[] = [
    "North Indian", "South Indian", "Bengali", "Punjabi", "Gujarati", "Rajasthani",
    "Local Jharkhand", "Tribal Cuisine", "Street Food", "Chinese", "Continental", 
    "Fast Food", "Vegetarian", "Vegan", "Sweets & Desserts"
  ];

  const facilityOptions: string[] = [
    "Air Conditioning", "Free WiFi", "Parking", "Home Delivery", "Online Ordering",
    "Party Booking", "Live Music", "Outdoor Seating", "Family Section", "Bar Service",
    "Buffet Service", "Private Dining", "Kids Play Area", "Wheelchair Accessible"
  ];

  const specialDietOptions: string[] = [
    "Vegetarian", "Vegan", "Jain Food", "Gluten-Free", "Sugar-Free", "Organic Food",
    "Low Sodium", "Keto-Friendly", "Diabetic Friendly"
  ];

  const paymentMethodOptions: string[] = [
    "Cash", "Credit Card", "Debit Card", "UPI", "Digital Wallets", "Net Banking", "COD"
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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
    const response=await fetch('/api/submit-restaurant-application',{
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
      businessType: "",
      establishedYear: "",
      cuisineTypes: [],
      specialties: "",
      seatingCapacity: "",
      operatingHours: "",
      deliveryService: false,
      takeawayService: false,
      cateringService: false,
      onlineOrdering: false,
      facilities: [],
      hygieneRating: "",
      staffCount: "",
      chefExperience: "",
      averageMealPrice: "",
      description: "",
      foodSafetyLicense: "",
      gstNumber: "",
      panNumber: "",
      specialDiets: [],
      paymentMethods: [],
      agreeToTerms: false
    });
  
    setFiles({
      businessLicense: null,
      foodSafetyLicense: null,
      kitchenPhotos: null,
      restaurantPhotos: null,
      menuCard: null,
      gstCertificate: null,
      panCard: null,
      hygieneCredentials: null
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Food & Dining Service Verification</h1>
          <p className="text-gray-600">Register your food business with Jharkhand Tourism</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Please provide complete information about your food and dining service
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business/Restaurant Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("businessName", e.target.value)}
                    placeholder="Enter business name"
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
                    placeholder="e.g., 2018"
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
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="foodSafetyLicense">Food Safety License Number *</Label>
                  <Input
                    id="foodSafetyLicense"
                    value={formData.foodSafetyLicense}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("foodSafetyLicense", e.target.value)}
                    placeholder="FSSAI License Number"
                    required
                  />
                </div>
              </div>

              {/* Address */}
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

              {/* Restaurant Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Restaurant Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seatingCapacity">Seating Capacity *</Label>
                    <Input
                      id="seatingCapacity"
                      type="number"
                      value={formData.seatingCapacity}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("seatingCapacity", e.target.value)}
                      placeholder="Number of seats"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="staffCount">Total Staff Count *</Label>
                    <Input
                      id="staffCount"
                      type="number"
                      value={formData.staffCount}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("staffCount", e.target.value)}
                      placeholder="Number of employees"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="chefExperience">Head Chef Experience *</Label>
                    <Select onValueChange={(value: string) => handleInputChange("chefExperience", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-3">0-3 years</SelectItem>
                        <SelectItem value="4-7">4-7 years</SelectItem>
                        <SelectItem value="8-15">8-15 years</SelectItem>
                        <SelectItem value="15+">15+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="averageMealPrice">Average Meal Price (₹) *</Label>
                    <Select onValueChange={(value: string) => handleInputChange("averageMealPrice", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget (₹50-200)</SelectItem>
                        <SelectItem value="mid-range">Mid-range (₹200-500)</SelectItem>
                        <SelectItem value="premium">Premium (₹500-1000)</SelectItem>
                        <SelectItem value="luxury">Luxury (₹1000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="operatingHours">Operating Hours *</Label>
                  <Input
                    id="operatingHours"
                    value={formData.operatingHours}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("operatingHours", e.target.value)}
                    placeholder="e.g., 9:00 AM - 10:00 PM"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="hygieneRating">Current Hygiene Rating</Label>
                  <Select onValueChange={(value: string) => handleInputChange("hygieneRating", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hygiene rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent (5 stars)</SelectItem>
                      <SelectItem value="very-good">Very Good (4 stars)</SelectItem>
                      <SelectItem value="good">Good (3 stars)</SelectItem>
                      <SelectItem value="fair">Fair (2 stars)</SelectItem>
                      <SelectItem value="needs-improvement">Needs Improvement (1 star)</SelectItem>
                      <SelectItem value="not-rated">Not Yet Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cuisine Types */}
              <div>
                <Label className="text-base font-medium">Cuisine Types *</Label>
                <p className="text-sm text-gray-600 mb-3">Select all cuisines you serve</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto border rounded-md p-3">
                  {cuisineOptions.map((cuisine: string) => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={cuisine}
                        checked={formData.cuisineTypes.includes(cuisine)}
                        onCheckedChange={(checked: boolean) => handleMultiSelectChange("cuisineTypes", cuisine, checked)}
                      />
                      <Label htmlFor={cuisine} className="text-sm font-normal">
                        {cuisine}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Diets */}
              <div>
                <Label className="text-base font-medium">Special Dietary Options</Label>
                <p className="text-sm text-gray-600 mb-3">Select dietary options you cater to</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specialDietOptions.map((diet: string) => (
                    <div key={diet} className="flex items-center space-x-2">
                      <Checkbox
                        id={diet}
                        checked={formData.specialDiets.includes(diet)}
                        onCheckedChange={(checked: boolean) => handleMultiSelectChange("specialDiets", diet, checked)}
                      />
                      <Label htmlFor={diet} className="text-sm font-normal">
                        {diet}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Services Offered</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="deliveryService"
                      checked={formData.deliveryService}
                      onCheckedChange={(checked: boolean) => handleInputChange("deliveryService", checked)}
                    />
                    <Label htmlFor="deliveryService">Home Delivery Service</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="takeawayService"
                      checked={formData.takeawayService}
                      onCheckedChange={(checked: boolean) => handleInputChange("takeawayService", checked)}
                    />
                    <Label htmlFor="takeawayService">Takeaway Service</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cateringService"
                      checked={formData.cateringService}
                      onCheckedChange={(checked: boolean) => handleInputChange("cateringService", checked)}
                    />
                    <Label htmlFor="cateringService">Catering Service</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onlineOrdering"
                      checked={formData.onlineOrdering}
                      onCheckedChange={(checked: boolean) => handleInputChange("onlineOrdering", checked)}
                    />
                    <Label htmlFor="onlineOrdering">Online Ordering System</Label>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div>
                <Label className="text-base font-medium">Facilities & Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-md p-3 mt-3">
                  {facilityOptions.map((facility: string) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <Checkbox
                        id={facility}
                        checked={formData.facilities.includes(facility)}
                        onCheckedChange={(checked: boolean) => handleMultiSelectChange("facilities", facility, checked)}
                      />
                      <Label htmlFor={facility} className="text-sm font-normal">
                        {facility}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <Label className="text-base font-medium">Accepted Payment Methods *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {paymentMethodOptions.map((method: string) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={method}
                        checked={formData.paymentMethods.includes(method)}
                        onCheckedChange={(checked: boolean) => handleMultiSelectChange("paymentMethods", method, checked)}
                      />
                      <Label htmlFor={method} className="text-sm font-normal">
                        {method}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="specialties">Signature Dishes & Specialties *</Label>
                <Textarea
                  id="specialties"
                  value={formData.specialties}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("specialties", e.target.value)}
                  placeholder="List your must-try dishes, specialties, and what makes your food unique"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Restaurant Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your restaurant, ambiance, history, and overall dining experience"
                  required
                />
              </div>

              {/* Legal Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Legal & Tax Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gstNumber">GST Number *</Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("gstNumber", e.target.value)}
                      placeholder="GST registration number"
                      required
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
                    <Label htmlFor="foodSafetyLicense">FSSAI License *</Label>
                    <Input
                      id="foodSafetyLicense"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("foodSafetyLicense", e.target.files?.[0] || null)}
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
                    <Label htmlFor="restaurantPhotos">Restaurant Photos *</Label>
                    <Input
                      id="restaurantPhotos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("restaurantPhotos", e.target.files)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="kitchenPhotos">Kitchen Photos *</Label>
                    <Input
                      id="kitchenPhotos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("kitchenPhotos", e.target.files)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="menuCard">Menu Card *</Label>
                    <Input
                      id="menuCard"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("menuCard", e.target.files)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="hygieneCredentials">Hygiene Certificates</Label>
                    <Input
                      id="hygieneCredentials"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("hygieneCredentials", e.target.files)}
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
                  I agree to the terms and conditions, food safety guidelines, and verification process *
                </Label>
              </div>

              <Alert>
                <AlertDescription>
                  Your restaurant will be reviewed within 5-7 business days. A hygiene inspection may be required for final approval.
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