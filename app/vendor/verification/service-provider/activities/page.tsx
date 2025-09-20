"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Palette, Upload, MapPin, Users, Shield, Clock, Star, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { FormEvent } from "react";
import { initializeRazorpayPayment,PaymentConfigs,RazorpayResponse } from "@/utils/razorpay";
interface FormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address: string;
  city: string;
  activityTypes: string[];
  experienceCategory: string;
  establishedYear: string;
  groupSize: string;
  duration: string;
  ageRestriction: string;
  difficultyLevel: string;
  seasonality: string;
  languages: string[];
  pricing: string;
  inclusions: string;
  exclusions: string;
  safetyMeasures: string;
  equipmentProvided: string[];
  certifications: string;
  staffCount: string;
  experience: string;
  description: string;
  cancellationPolicy: string;
  weatherPolicy: string;
  emergencyContact: string;
  gstNumber: string;
  insuranceProvider: string;
  operatingDays: string[];
  operatingHours: string;
  bookingAdvance: string;
  customPackages: boolean;
  privateGroups: boolean;
  corporateEvents: boolean;
  wheelchairAccessible: boolean;
  agreeToTerms: boolean;
}

interface Files {
  businessLicense: File | null;
  safetyCredentials: FileList | null;
  instructorCredentials: FileList | null;
  equipmentPhotos: FileList | null;
  activityPhotos: FileList | null;
  insurance: File | null;
  panCard: File | null;
  testimonials: FileList | null;
}

export default function ActivityVerification() {
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    activityTypes: [],
    experienceCategory: "",
    establishedYear: "",
    groupSize: "",
    duration: "",
    ageRestriction: "",
    difficultyLevel: "",
    seasonality: "",
    languages: [],
    pricing: "",
    inclusions: "",
    exclusions: "",
    safetyMeasures: "",
    equipmentProvided: [],
    certifications: "",
    staffCount: "",
    experience: "",
    description: "",
    cancellationPolicy: "",
    weatherPolicy: "",
    emergencyContact: "",
    gstNumber: "",
    insuranceProvider: "",
    operatingDays: [],
    operatingHours: "",
    bookingAdvance: "",
    customPackages: false,
    privateGroups: false,
    corporateEvents: false,
    wheelchairAccessible: false,
    agreeToTerms: false
  });

  const [files, setFiles] = useState<Files>({
    businessLicense: null,
    safetyCredentials: null,
    instructorCredentials: null,
    equipmentPhotos: null,
    activityPhotos: null,
    insurance: null,
    panCard: null,
    testimonials: null
  });

  const activityTypeOptions: string[] = [
    "Trekking & Hiking", "Rock Climbing", "River Rafting", "Paragliding", "Wildlife Safari",
    "Bird Watching", "Photography Tours", "Cultural Shows", "Tribal Dance Performance",
    "Traditional Music", "Handicraft Workshops", "Cooking Classes", "Pottery Making",
    "Tribal Village Tours", "Forest Camping", "Adventure Sports", "Cycling Tours",
    "Waterfall Rappelling", "Cave Exploration", "Meditation Retreats", "Yoga Sessions"
  ];

  const experienceCategories: string[] = [
    "Adventure Sports", "Cultural Experience", "Nature & Wildlife", "Art & Craft",
    "Food & Cooking", "Wellness & Spirituality", "Photography", "Educational Tours"
  ];

  const languageOptions: string[] = [
    "Hindi", "English", "Santhali", "Ho", "Mundari", "Kurukh", "Kharia", "Bengali", "Urdu"
  ];

  const equipmentOptions: string[] = [
    "Safety Gear", "Helmets", "Harness", "Ropes", "First Aid Kit", "Life Jackets",
    "Climbing Equipment", "Trekking Poles", "Tents", "Sleeping Bags", "Cooking Equipment",
    "Photography Equipment", "Art Supplies", "Musical Instruments", "Traditional Costumes"
  ];

  const operatingDaysOptions: string[] = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const handleInputChange = (name: keyof FormData, value: string | boolean): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (fieldName: keyof FormData, option: string, checked: boolean): void => {
    if (checked) {
      setFormData(prev => ({ 
        ...prev, 
        [fieldName]: [...(prev[fieldName] as string[]), option] 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [fieldName]: (prev[fieldName] as string[]).filter((item: string) => item !== option) 
      }));
    }
  };

  const handleFileChange = (fieldName: keyof Files, file: File | FileList | null): void => {
    setFiles(prev => ({ ...prev, [fieldName]: file }));
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
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
  const {user}=useUser();
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

    
    
      Object.keys(formData).forEach((key) => {
        const typedKey = key as keyof FormData;
        if (Array.isArray(formData[typedKey])) {
          submitData.append(key, JSON.stringify(formData[typedKey]));
        } else {
          submitData.append(key, String(formData[typedKey]));
        }
      });
      
      Object.keys(files).forEach((key) => {
        const typedKey = key as keyof Files;
        const fileValue = files[typedKey];
        if (fileValue) {
          if (fileValue instanceof FileList) {
            Array.from(fileValue).forEach((file, index) => {
              submitData.append(`${key}[${index}]`, file);
            });
          } else {
            submitData.append(key, fileValue);
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
    const response=await fetch('/api/submit-activites-application',{
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
      activityTypes: [],
      experienceCategory: "",
      establishedYear: "",
      groupSize: "",
      duration: "",
      ageRestriction: "",
      difficultyLevel: "",
      seasonality: "",
      languages: [],
      pricing: "",
      inclusions: "",
      exclusions: "",
      safetyMeasures: "",
      equipmentProvided: [],
      certifications: "",
      staffCount: "",
      experience: "",
      description: "",
      cancellationPolicy: "",
      weatherPolicy: "",
      emergencyContact: "",
      gstNumber: "",
      insuranceProvider: "",
      operatingDays: [],
      operatingHours: "",
      bookingAdvance: "",
      customPackages: false,
      privateGroups: false,
      corporateEvents: false,
      wheelchairAccessible: false,
      agreeToTerms: false
    });
  
    setFiles({
      businessLicense: null,
      safetyCredentials: null,
      instructorCredentials: null,
      equipmentPhotos: null,
      activityPhotos: null,
      insurance: null,
      panCard: null,
      testimonials: null
    });
    
    console.log("Activity service verification submitted:", formData, files);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity & Experience Provider Verification</h1>
          <p className="text-gray-600">Register your activity/experience business with Jharkhand Tourism</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Please provide complete information about your activity and experience services
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    placeholder="Enter business name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="ownerName">Owner/Manager Name *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange("ownerName", e.target.value)}
                    placeholder="Enter owner name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="experienceCategory">Primary Category *</Label>
                  <Select onValueChange={(value) => handleInputChange("experienceCategory", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
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
                    onChange={(e) => handleInputChange("establishedYear", e.target.value)}
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
                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                    onChange={(e) => handleInputChange("phone", e.target.value)}
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
                    onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select onValueChange={(value) => handleInputChange("experience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Business Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter complete address where activities are conducted"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="e.g., Ranchi, Jamshedpur"
                  required
                />
              </div>

              {/* Activity Types */}
              <div>
                <Label className="text-base font-medium">Activities & Experiences Offered *</Label>
                <p className="text-sm text-gray-600 mb-3">Select all activities you provide</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-md p-3">
                  {activityTypeOptions.map((activity) => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Checkbox
                        id={activity}
                        checked={formData.activityTypes.includes(activity)}
                        onCheckedChange={(checked) => handleMultiSelectChange("activityTypes", activity, !!checked)}
                      />
                      <Label htmlFor={activity} className="text-sm font-normal">
                        {activity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Activity Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="groupSize">Maximum Group Size *</Label>
                    <Select onValueChange={(value) => handleInputChange("groupSize", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select group size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 people</SelectItem>
                        <SelectItem value="6-10">6-10 people</SelectItem>
                        <SelectItem value="11-20">11-20 people</SelectItem>
                        <SelectItem value="21-50">21-50 people</SelectItem>
                        <SelectItem value="50+">50+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Activity Duration *</Label>
                    <Select onValueChange={(value) => handleInputChange("duration", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                        <SelectItem value="3-5 hours">3-5 hours</SelectItem>
                        <SelectItem value="Full day">Full day</SelectItem>
                        <SelectItem value="2-3 days">2-3 days</SelectItem>
                        <SelectItem value="1 week+">1 week+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ageRestriction">Age Restriction *</Label>
                    <Select onValueChange={(value) => handleInputChange("ageRestriction", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All ages">All ages</SelectItem>
                        <SelectItem value="5+">5 years and above</SelectItem>
                        <SelectItem value="12+">12 years and above</SelectItem>
                        <SelectItem value="18+">18 years and above</SelectItem>
                        <SelectItem value="21+">21 years and above</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficultyLevel">Difficulty Level *</Label>
                    <Select onValueChange={(value) => handleInputChange("difficultyLevel", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                        <SelectItem value="All levels">All levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="seasonality">Best Season *</Label>
                    <Select onValueChange={(value) => handleInputChange("seasonality", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Year-round">Year-round</SelectItem>
                        <SelectItem value="Winter">Winter (Nov-Feb)</SelectItem>
                        <SelectItem value="Summer">Summer (Mar-Jun)</SelectItem>
                        <SelectItem value="Monsoon">Monsoon (Jul-Oct)</SelectItem>
                        <SelectItem value="Post-monsoon">Post-monsoon (Sep-Nov)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="staffCount">Total Staff/Instructors *</Label>
                    <Input
                      id="staffCount"
                      type="number"
                      value={formData.staffCount}
                      onChange={(e) => handleInputChange("staffCount", e.target.value)}
                      placeholder="Number of staff"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="bookingAdvance">Advance Booking Required *</Label>
                    <Select onValueChange={(value) => handleInputChange("bookingAdvance", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select booking time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Same day">Same day</SelectItem>
                        <SelectItem value="1 day">1 day before</SelectItem>
                        <SelectItem value="2-3 days">2-3 days before</SelectItem>
                        <SelectItem value="1 week">1 week before</SelectItem>
                        <SelectItem value="2+ weeks">2+ weeks before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pricing">Pricing (₹ per person) *</Label>
                    <Input
                      id="pricing"
                      value={formData.pricing}
                      onChange={(e) => handleInputChange("pricing", e.target.value)}
                      placeholder="e.g., ₹500-2000 or starting from ₹800"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="operatingHours">Operating Hours *</Label>
                  <Input
                    id="operatingHours"
                    value={formData.operatingHours}
                    onChange={(e) => handleInputChange("operatingHours", e.target.value)}
                    placeholder="e.g., 6:00 AM - 6:00 PM"
                    required
                  />
                </div>
              </div>

              {/* Languages */}
              <div>
                <Label className="text-base font-medium">Languages Spoken *</Label>
                <p className="text-sm text-gray-600 mb-3">Select languages your team can communicate in</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {languageOptions.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={language}
                        checked={formData.languages.includes(language)}
                        onCheckedChange={(checked) => handleMultiSelectChange("languages", language, !!checked)}
                      />
                      <Label htmlFor={language} className="text-sm font-normal">
                        {language}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operating Days */}
              <div>
                <Label className="text-base font-medium">Operating Days *</Label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mt-3">
                  {operatingDaysOptions.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formData.operatingDays.includes(day)}
                        onCheckedChange={(checked) => handleMultiSelectChange("operatingDays", day, !!checked)}
                      />
                      <Label htmlFor={day} className="text-sm font-normal">
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment Provided */}
              <div>
                <Label className="text-base font-medium">Equipment & Materials Provided</Label>
                <p className="text-sm text-gray-600 mb-3">Select what you provide to participants</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-md p-3">
                  {equipmentOptions.map((equipment) => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment}
                        checked={formData.equipmentProvided.includes(equipment)}
                        onCheckedChange={(checked) => handleMultiSelectChange("equipmentProvided", equipment, !!checked)}
                      />
                      <Label htmlFor={equipment} className="text-sm font-normal">
                        {equipment}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Options */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Additional Services</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="customPackages"
                      checked={formData.customPackages}
                      onCheckedChange={(checked) => handleInputChange("customPackages", !!checked)}
                    />
                    <Label htmlFor="customPackages">Custom Packages Available</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privateGroups"
                      checked={formData.privateGroups}
                      onCheckedChange={(checked) => handleInputChange("privateGroups", !!checked)}
                    />
                    <Label htmlFor="privateGroups">Private Group Sessions</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="corporateEvents"
                      checked={formData.corporateEvents}
                      onCheckedChange={(checked) => handleInputChange("corporateEvents", !!checked)}
                    />
                    <Label htmlFor="corporateEvents">Corporate Team Building Events</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wheelchairAccessible"
                      checked={formData.wheelchairAccessible}
                      onCheckedChange={(checked) => handleInputChange("wheelchairAccessible", !!checked)}
                    />
                    <Label htmlFor="wheelchairAccessible">Wheelchair Accessible</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="inclusions">What's Included *</Label>
                <Textarea
                  id="inclusions"
                  value={formData.inclusions}
                  onChange={(e) => handleInputChange("inclusions", e.target.value)}
                  placeholder="List everything included in your activity/experience package"
                  required
                />
              </div>

              <div>
                <Label htmlFor="exclusions">What's Not Included</Label>
                <Textarea
                  id="exclusions"
                  value={formData.exclusions}
                  onChange={(e) => handleInputChange("exclusions", e.target.value)}
                  placeholder="List what participants need to bring or pay extra for"
                />
              </div>

              <div>
                <Label htmlFor="safetyMeasures">Safety Measures & Protocols *</Label>
                <Textarea
                  id="safetyMeasures"
                  value={formData.safetyMeasures}
                  onChange={(e) => handleInputChange("safetyMeasures", e.target.value)}
                  placeholder="Describe your safety protocols, emergency procedures, and risk management"
                  required
                />
              </div>

              <div>
                <Label htmlFor="certifications">Certifications & Qualifications</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => handleInputChange("certifications", e.target.value)}
                  placeholder="List relevant certifications, training, and qualifications of your team"
                />
              </div>

              <div>
                <Label htmlFor="description">Experience Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your activities, what makes them unique, and the overall experience"
                  required
                />
              </div>

              {/* Policies */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Policies</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cancellationPolicy">Cancellation Policy *</Label>
                    <Textarea
                      id="cancellationPolicy"
                      value={formData.cancellationPolicy}
                      onChange={(e) => handleInputChange("cancellationPolicy", e.target.value)}
                      placeholder="Explain your cancellation and refund policy"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="weatherPolicy">Weather Policy *</Label>
                    <Textarea
                      id="weatherPolicy"
                      value={formData.weatherPolicy}
                      onChange={(e) => handleInputChange("weatherPolicy", e.target.value)}
                      placeholder="How do you handle bad weather conditions?"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      placeholder="Contact person name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstNumber">GST Number *</Label>
                    <Input
                      id="gstNumber"
                      type="tel"
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                      placeholder="adsfder123vdfa"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                    placeholder="Insurance company name (if applicable)"
                  />
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
                      onChange={(e) => handleFileChange("businessLicense", e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="safetyCredentials">Safety Certificates *</Label>
                    <Input
                      id="safetyCredentials"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => handleFileChange("safetyCredentials", e.target.files)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instructorCredentials">Instructor Credentials</Label>
                    <Input
                      id="instructorCredentials"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => handleFileChange("instructorCredentials", e.target.files)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="activityPhotos">Activity Photos *</Label>
                    <Input
                      id="activityPhotos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange("activityPhotos", e.target.files)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="equipmentPhotos">Equipment Photos</Label>
                    <Input
                      id="equipmentPhotos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange("equipmentPhotos", e.target.files)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="insurance">Insurance Documents</Label>
                    <Input
                      id="insurance"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => handleFileChange("insurance", e.target.files)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="panCard">PAN Card *</Label>
                    <Input
                      id="panCard"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => handleFileChange("panCard", e.target.files)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="testimonials">Customer Testimonials</Label>
                    <Input
                      id="testimonials"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => handleFileChange("testimonials", e.target.files)}
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                  required
                />
                <Label htmlFor="agreeToTerms" className="text-sm">
                  I agree to the terms and conditions, safety guidelines, and verification process *
                </Label>
              </div>

              <Alert>
                <AlertDescription>
                  Your application will be reviewed within 7-10 business days. A site inspection may be required for adventure activities.
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