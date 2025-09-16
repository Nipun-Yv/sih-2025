"use client";
import { useState,ChangeEvent,FormEvent } from "react";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert,AlertDescription } from "@/components/ui/alert";
import {User,Upload,MapPin,Languages,Award,Phone,Mail} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FormData={
    fullName:string;
    email:string;
    phone:string;
    address:string;
    city:string;
    state:string;
    experience:string;
    specialization:string;
    languages:string[];
    certifications:string;
    description:string;
    emergencyContact:string;
    panNumber:string;
    agreeToTerms:boolean;
};

type Files={
    photo:File|null;
    idProof:File|null;
    certificates:FileList|null;
    experienceProof:FileList|null;
};

export default function GuideVerification(){
    const [formData,setFormData]=useState<FormData>({
        fullName: "",
        email: "",
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
    const [files,setFiles]=useState<Files>({
        photo:null,
        idProof:null,
        certificates:null,
        experienceProof:null
    })
    const languageOptions=[
        "Hindi","English","Santhali","Ho","Mundari","Kurukh","Kharia","Bengali","Urdu"
    ]
    const specializationOptions = [
        "Wildlife & Nature", "Cultural Heritage", "Adventure Sports", "Tribal Culture", 
        "Historical Sites", "Eco-tourism", "Photography", "Trekking & Hiking"
    ];

    const handleLanguageChange = (language:string, checked:boolean) => {
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
    
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
 
    // Create FormData for file uploads
    const submitData = new FormData();
    
    // Append form data
    Object.keys(formData).forEach(key => {
    // Append form data
    (Object.keys(formData) as (keyof FormData)[]).forEach(key => {
        if (key === "languages") {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, String(formData[key]));
        }
      });
  
      // Append files
      (Object.keys(files) as (keyof Files)[]).forEach(key => {
        const file = files[key];
        if (file instanceof File) {
          submitData.append(key, file);
        } else if (file instanceof FileList) {
          Array.from(file).forEach(f => submitData.append(key, f));
        }
      });
  
      console.log("Form submitted with data:", formData, files);
      // 🔗 TODO: send `submitData` to your backend
    });
    
    console.log("Form submitted with data:", formData, files);
    // Here you would send to your backend API
    };   
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Guide Verification</h1>
              <p className="text-gray-600">Join our verified guide network and help tourists explore Jharkhand</p>
            </div>
    
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal & Professional Information
                </CardTitle>
                <CardDescription>
                  Please provide accurate information for verification purposes
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
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
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="e.g., Ranchi, Jamshedpur"
                        required
                      />
                    </div>
                  </div>
    
                  <div>
                    <Label htmlFor="address">Complete Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter your complete address"
                      required
                    />
                  </div>
    
                  {/* Professional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience">Years of Experience *</Label>
                      <Select onValueChange={(value) => handleInputChange("experience", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">0-1 years</SelectItem>
                          <SelectItem value="2-5">2-5 years</SelectItem>
                          <SelectItem value="6-10">6-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="specialization">Specialization *</Label>
                      <Select onValueChange={(value) => handleInputChange("specialization", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {specializationOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
    
                  {/* Languages */}
                  <div>
                    <Label className="text-base font-medium">Languages Spoken *</Label>
                    <p className="text-sm text-gray-600 mb-3">Select all languages you can guide in</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {languageOptions.map((language) => (
                        <div key={language} className="flex items-center space-x-2">
                          <Checkbox
                            id={language}
                            checked={formData.languages.includes(language)}
                            onCheckedChange={(checked) => handleLanguageChange(language, Boolean(checked))}
                          />
                          <Label htmlFor={language} className="text-sm font-normal">
                            {language}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
    
                  <div>
                    <Label htmlFor="certifications">Certifications & Qualifications</Label>
                    <Textarea
                      id="certifications"
                      value={formData.certifications}
                      onChange={(e) => handleInputChange("certifications", e.target.value)}
                      placeholder="List any tourism certifications, degrees, or relevant qualifications"
                    />
                  </div>
    
                  <div>
                    <Label htmlFor="description">About Yourself *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Tell us about your guiding experience, areas of expertise, and what makes you unique"
                      required
                    />
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
                        <Label htmlFor="panNumber">Emergency Contact Phone *</Label>
                        <Input
                          id="panNumber"
                          type="tel"
                          value={formData.panNumber}
                          onChange={(e) => handleInputChange("panNumber", e.target.value)}
                          placeholder="+91 9876543210"
                          required
                        />
                      </div>
                    </div>
                  </div>
    
                  {/* File Uploads */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Document Uploads
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="photo">Profile Photo *</Label>
                        <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                handleFileChange("photo", file);
                            }}
                            required
                            />
                      </div>
                      
                      <div>
                        <Label htmlFor="idProof">Government ID Proof *</Label>
                        <Input
                          id="idProof"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) =>{
                            const file=e.target.files?.[0]??null;
                            handleFileChange("idProof",file)
                          } }
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="certificates">Certificates (Optional)</Label>
                        <Input
                          id="certificates"
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => handleFileChange("certificates", e.target.files)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="experienceProof">Experience Proof (Optional)</Label>
                        <Input
                          id="experienceProof"
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => handleFileChange("experienceProof", e.target.files)}
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
                      I agree to the terms and conditions and privacy policy *
                    </Label>
                  </div>
    
                  <Alert>
                    <AlertDescription>
                      Your application will be reviewed within 3-5 business days. You'll receive an email notification once verified.
                    </AlertDescription>
                  </Alert>
    
                  <Button type="submit" className="w-full" size="lg">
                    Submit Verification Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      );
}