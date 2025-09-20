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
import { Car, Upload, MapPin, Shield, Clock, Phone, Loader2 } from "lucide-react";
import { initializeRazorpayPayment, PaymentConfigs, RazorpayResponse } from "@/utils/razorpay";
import { useUser } from "@clerk/nextjs";

interface FormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  panNumber: string;
  address: string;
  city: string;
  serviceType: string;
  vehicleCount: string;
  operatingAreas: string[];
  serviceHours: string;
  emergencyService: boolean;
  airportService: boolean;
  tourPackages: boolean;
  description: string;
  experience: string;
  driverCount: string;
  licenseNumber: string;
  insuranceProvider: string;
  baseCharges: string;
  kmCharges: string;
  waitingCharges: string;
  cancellationPolicy: string;
  agreeToTerms: boolean;
}

interface Vehicle {
  type: string;
  model: string;
  year: string;
  capacity: string;
  features: string[];
  registrationNumber: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
}

interface Files {
  businessLicense: File | null;
  drivingLicense: File | null;
  vehicleRegistration: FileList | null;
  insurance: FileList | null;
  fitnessCredential: FileList | null;
  vehiclePhotos: FileList | null;
  panCard: File | null;
}

type FormDataKey = keyof FormData;
type VehicleKey = keyof Vehicle;
type FilesKey = keyof Files;

export default function TransportationVerification(){
  const { user } = useUser();
  
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    panNumber: "",
    address: "",
    city: "",
    serviceType: "",
    vehicleCount: "",
    operatingAreas: [],
    serviceHours: "",
    emergencyService: false,
    airportService: false,
    tourPackages: false,
    description: "",
    experience: "",
    driverCount: "",
    licenseNumber: "",
    insuranceProvider: "",
    baseCharges: "",
    kmCharges: "",
    waitingCharges: "",
    cancellationPolicy: "",
    agreeToTerms: false
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([{
    type: "",
    model: "",
    year: "",
    capacity: "",
    features: [],
    registrationNumber: "",
    insuranceExpiry: "",
    fitnessExpiry: ""
  }]);

  const [files, setFiles] = useState<Files>({
    businessLicense: null,
    drivingLicense: null,
    vehicleRegistration: null,
    insurance: null,
    fitnessCredential: null,
    vehiclePhotos: null,
    panCard: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const serviceTypes: string[] = [
    "Taxi Service", "Car Rental", "Bus Service", "Tempo Traveller", 
    "Bike/Scooter Rental", "Auto Rickshaw", "Jeep Safari", "Luxury Cars"
  ];

  const vehicleTypes: string[] = [
    "Hatchback", "Sedan", "SUV", "MUV", "Tempo Traveller", "Bus", "Mini Bus",
    "Bike", "Scooter", "Auto Rickshaw", "Jeep", "Luxury Car"
  ];

  const operatingAreaOptions: string[] = [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", 
    "Giridih", "Ramgarh", "Chaibasa", "Daltonganj", "Entire Jharkhand", "Inter-state"
  ];

  const vehicleFeatures: string[] = [
    "AC", "Music System", "GPS", "First Aid Kit", "Fire Extinguisher",
    "Clean Interior", "Comfortable Seats", "Luggage Space", "Phone Charger",
    "Water Bottles", "Tourist Guide Books"
  ];

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

  const handleVehicleChange = (index: number, field: VehicleKey, value: string): void => {
    const updatedVehicles = vehicles.map((vehicle, i) => 
      i === index ? { ...vehicle, [field]: value } : vehicle
    );
    setVehicles(updatedVehicles);
  };

  const handleVehicleFeatureChange = (vehicleIndex: number, feature: string, checked: boolean): void => {
    const updatedVehicles = vehicles.map((vehicle, i) => {
      if (i === vehicleIndex) {
        const updatedFeatures = checked 
          ? [...vehicle.features, feature]
          : vehicle.features.filter(f => f !== feature);
        return { ...vehicle, features: updatedFeatures };
      }
      return vehicle;
    });
    setVehicles(updatedVehicles);
  };

  const addVehicle = (): void => {
    setVehicles([...vehicles, {
      type: "",
      model: "",
      year: "",
      capacity: "",
      features: [],
      registrationNumber: "",
      insuranceExpiry: "",
      fitnessExpiry: ""
    }]);
  };

  const removeVehicle = (index: number): void => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter((_, i) => i !== index));
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
    
    if (!formData.agreeToTerms) {
      setSubmitMessage({ type: 'error', message: 'Please agree to terms and conditions' });
      return;
    }

    if (!user) {
      setSubmitMessage({ type: 'error', message: 'Please log in to submit application' });
      return;
    }

    if (formData.operatingAreas.length === 0) {
      setSubmitMessage({ type: 'error', message: 'Please select at least one operating area' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      console.log("Initializing payment");
      const paymentResponse = await processPayment();
      
      if (!paymentResponse.razorpay_payment_id) {
        throw new Error('Payment not completed');
      }

      const submitData = new FormData();
      
      (Object.keys(formData) as FormDataKey[]).forEach(key => {
        const value = formData[key];
        if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value.toString());
        }
      });
      
      submitData.append('vehicles', JSON.stringify(vehicles));
      
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

      console.log('Submitting transportation application');
      
      const response = await fetch('/api/submit-transport-application', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }

      console.log("Response from API:", response);
      
      setSubmitMessage({
        type: 'success',
        message: 'Transportation application submitted successfully!'
      });

      setFormData({
        businessName: "",
        ownerName: "",
        email: "",
        phone: "",
        panNumber: "",
        address: "",
        city: "",
        serviceType: "",
        vehicleCount: "",
        operatingAreas: [],
        serviceHours: "",
        emergencyService: false,
        airportService: false,
        tourPackages: false,
        description: "",
        experience: "",
        driverCount: "",
        licenseNumber: "",
        insuranceProvider: "",
        baseCharges: "",
        kmCharges: "",
        waitingCharges: "",
        cancellationPolicy: "",
        agreeToTerms: false
      });

      setVehicles([{
        type: "",
        model: "",
        year: "",
        capacity: "",
        features: [],
        registrationNumber: "",
        insuranceExpiry: "",
        fitnessExpiry: ""
      }]);

      setFiles({
        businessLicense: null,
        drivingLicense: null,
        vehicleRegistration: null,
        insurance: null,
        fitnessCredential: null,
        vehiclePhotos: null,
        panCard: null
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transportation Service Verification</h1>
          <p className="text-gray-600">Register your transportation business with Jharkhand Tourism</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Please provide complete information about your transportation service
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {submitMessage && (
              <Alert className={`mb-6 ${submitMessage.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
                <AlertDescription className={submitMessage.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                  {submitMessage.message}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("businessName", e.target.value)}
                    placeholder="Enter business name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("ownerName", e.target.value)}
                    placeholder="Enter owner name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select onValueChange={(value: string) => handleInputChange("serviceType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type: string) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience">Years in Business *</Label>
                  <Select onValueChange={(value: string) => handleInputChange("experience", value)}>
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
                  <Label htmlFor="panNumber">PAN Number *</Label>
                  <Input
                    id="panNumber"
                    value={formData.panNumber}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("panNumber", e.target.value)}
                    placeholder="Enter PAN card number"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="licenseNumber">Transport License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("licenseNumber", e.target.value)}
                    placeholder="Enter transport license number"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Business Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("address", e.target.value)}
                  placeholder="Enter complete business address"
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

              {/* Service Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Service Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicleCount">Total Vehicles *</Label>
                    <Input
                      id="vehicleCount"
                      type="number"
                      value={formData.vehicleCount}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("vehicleCount", e.target.value)}
                      placeholder="Number of vehicles"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="driverCount">Number of Drivers *</Label>
                    <Input
                      id="driverCount"
                      type="number"
                      value={formData.driverCount}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("driverCount", e.target.value)}
                      placeholder="Number of drivers"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="serviceHours">Operating Hours *</Label>
                    <Select onValueChange={(value: string) => handleInputChange("serviceHours", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select operating hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6am-10pm">6:00 AM - 10:00 PM</SelectItem>
                        <SelectItem value="24x7">24 Hours</SelectItem>
                        <SelectItem value="custom">Custom Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="insuranceProvider">Insurance Provider *</Label>
                    <Input
                      id="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("insuranceProvider", e.target.value)}
                      placeholder="Insurance company name"
                      required
                    />
                  </div>
                </div>

                {/* Service Options */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emergencyService"
                      checked={formData.emergencyService}
                      onCheckedChange={(checked: boolean) => handleInputChange("emergencyService", checked)}
                    />
                    <Label htmlFor="emergencyService">24/7 Emergency Service Available</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="airportService"
                      checked={formData.airportService}
                      onCheckedChange={(checked: boolean) => handleInputChange("airportService", checked)}
                    />
                    <Label htmlFor="airportService">Airport Pickup/Drop Service</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tourPackages"
                      checked={formData.tourPackages}
                      onCheckedChange={(checked: boolean) => handleInputChange("tourPackages", checked)}
                    />
                    <Label htmlFor="tourPackages">Tour Package Services</Label>
                  </div>
                </div>
              </div>

              {/* Operating Areas */}
              <div>
                <Label className="text-base font-medium">Operating Areas *</Label>
                <p className="text-sm text-gray-600 mb-3">Select areas where you provide service</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {operatingAreaOptions.map((area: string) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={formData.operatingAreas.includes(area)}
                        onCheckedChange={(checked: boolean) => handleMultiSelectChange("operatingAreas", area, checked)}
                      />
                      <Label htmlFor={area} className="text-sm font-normal">
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
                
                {vehicles.map((vehicle: Vehicle, index: number) => (
                  <Card key={index} className="mb-4">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Vehicle {index + 1}</CardTitle>
                        {vehicles.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVehicle(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Vehicle Type *</Label>
                          <Select 
                            value={vehicle.type}
                            onValueChange={(value: string) => handleVehicleChange(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicleTypes.map((type: string) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Model/Brand *</Label>
                          <Input
                            value={vehicle.model}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleVehicleChange(index, "model", e.target.value)}
                            placeholder="e.g., Maruti Swift"
                            required
                          />
                        </div>

                        <div>
                          <Label>Year *</Label>
                          <Input
                            type="number"
                            value={vehicle.year}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleVehicleChange(index, "year", e.target.value)}
                            placeholder="e.g., 2020"
                            min="2000"
                            max="2024"
                            required
                          />
                        </div>

                        <div>
                          <Label>Seating Capacity *</Label>
                          <Input
                            type="number"
                            value={vehicle.capacity}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleVehicleChange(index, "capacity", e.target.value)}
                            placeholder="e.g., 4"
                            min="1"
                            required
                          />
                        </div>

                        <div>
                          <Label>Registration Number *</Label>
                          <Input
                            value={vehicle.registrationNumber}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleVehicleChange(index, "registrationNumber", e.target.value)}
                            placeholder="e.g., JH01AA1234"
                            required
                          />
                        </div>

                        <div>
                          <Label>Insurance Expiry *</Label>
                          <Input
                            type="date"
                            value={vehicle.insuranceExpiry}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleVehicleChange(index, "insuranceExpiry", e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label>Fitness Certificate Expiry *</Label>
                          <Input
                            type="date"
                            value={vehicle.fitnessExpiry}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleVehicleChange(index, "fitnessExpiry", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Vehicle Features */}
                      <div>
                        <Label className="text-base font-medium">Vehicle Features</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {vehicleFeatures.map((feature: string) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${index}-${feature}`}
                                checked={vehicle.features.includes(feature)}
                                onCheckedChange={(checked: boolean) => handleVehicleFeatureChange(index, feature, checked)}
                              />
                              <Label htmlFor={`${index}-${feature}`} className="text-sm font-normal">
                                {feature}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button type="button" variant="outline" onClick={addVehicle}>
                  Add Another Vehicle
                </Button>
              </div>

              {/* Pricing Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="baseCharges">Base Charges (₹) *</Label>
                    <Input
                      id="baseCharges"
                      type="number"
                      value={formData.baseCharges}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("baseCharges", e.target.value)}
                      placeholder="Starting fare"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="kmCharges">Per KM Charges (₹) *</Label>
                    <Input
                      id="kmCharges"
                      type="number"
                      value={formData.kmCharges}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("kmCharges", e.target.value)}
                      placeholder="Rate per kilometer"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="waitingCharges">Waiting Charges (₹/hour)</Label>
                    <Input
                      id="waitingCharges"
                      type="number"
                      value={formData.waitingCharges}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("waitingCharges", e.target.value)}
                      placeholder="Waiting charges"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your transportation service, specialties, and what makes you different"
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

              {/* File Uploads */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Document Uploads
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessLicense">Transport License *</Label>
                    <Input
                      id="businessLicense"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("businessLicense", e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="drivingLicense">Driving License *</Label>
                    <Input
                      id="drivingLicense"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("drivingLicense", e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicleRegistration">Vehicle RC *</Label>
                    <Input
                      id="vehicleRegistration"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("vehicleRegistration", e.target.files)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="insurance">Insurance Papers *</Label>
                    <Input
                      id="insurance"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("insurance", e.target.files)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="fitnessCredential">Fitness Certificate *</Label>
                    <Input
                      id="fitnessCredential"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("fitnessCredential", e.target.files)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vehiclePhotos">Vehicle Photos *</Label>
                    <Input
                      id="vehiclePhotos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("vehiclePhotos", e.target.files)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="panCard">PAN Card *</Label>
                    <Input
                      id="panCard"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange("panCard", e.target.files?.[0] || null)}
                      required
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
                  I agree to the terms and conditions, safety guidelines, and verification process *
                </Label>
              </div>

              <Alert>
                <AlertDescription>
                  Your application will be reviewed within 5-7 business days. Vehicle inspection may be required for final approval.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
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