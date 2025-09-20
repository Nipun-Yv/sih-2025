import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FormSubmissionService } from '@/utils/form-submission-service';

interface Vehicle {
    type: string;
    model: string;
    year: string;
    capacity: string;
    registrationNumber: string;
    insuranceExpiry: string;
    fitnessExpiry: string;
    [key: string]: string; 
  }
  
  interface ApplicationData {
    vehicles: Vehicle[];
  }

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Entered the function of submitting transportation application", userId);
    
    if (!userId) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const getFormValue = (key: string): string => {
      const value = formData.get(key);
      return value ? String(value).trim() : '';
    };

    const getBooleanValue = (key: string): boolean => {
      const value = formData.get(key);
      return value === 'true';
    };

    const applicationData = {
      businessName: getFormValue('businessName'),
      ownerName: getFormValue('ownerName'),
      email: getFormValue('email'),
      phone: getFormValue('phone'),
      panNumber: getFormValue('panNumber'),
      address: getFormValue('address'),
      city: getFormValue('city'),
      serviceType: getFormValue('serviceType'),
      vehicleCount: getFormValue('vehicleCount'),
      operatingAreas: JSON.parse(getFormValue('operatingAreas') || '[]'),
      serviceHours: getFormValue('serviceHours'),
      emergencyService: getBooleanValue('emergencyService'),
      airportService: getBooleanValue('airportService'),
      tourPackages: getBooleanValue('tourPackages'),
      description: getFormValue('description'),
      experience: getFormValue('experience'),
      driverCount: getFormValue('driverCount'),
      licenseNumber: getFormValue('licenseNumber'),
      insuranceProvider: getFormValue('insuranceProvider'),
      baseCharges: getFormValue('baseCharges'),
      kmCharges: getFormValue('kmCharges'),
      waitingCharges: getFormValue('waitingCharges'),
      cancellationPolicy: getFormValue('cancellationPolicy'),
      agreeToTerms: getBooleanValue('agreeToTerms'),
      vehicles: JSON.parse(getFormValue('vehicles') || '[]'),
    };
    
    console.log("Transportation application data is:", applicationData);

    const paymentData = {
      razorpayPaymentId: getFormValue('razorpayPaymentId'),
      razorpayOrderId: getFormValue('razorpayOrderId'),
      razorpaySignature: getFormValue('razorpaySignature'),
      amount: parseInt(getFormValue('razorpayAmount') || '0'),
    };
    const requiredFields = {
      businessName: applicationData.businessName,
      ownerName: applicationData.ownerName,
      email: applicationData.email,
      phone: applicationData.phone,
      address: applicationData.address,
      city: applicationData.city,
      serviceType: applicationData.serviceType,
      vehicleCount: applicationData.vehicleCount,
      description: applicationData.description,
      experience: applicationData.experience,
      driverCount: applicationData.driverCount,
      licenseNumber: applicationData.licenseNumber,
      insuranceProvider: applicationData.insuranceProvider,
      baseCharges: applicationData.baseCharges,
      kmCharges: applicationData.kmCharges,
      cancellationPolicy: applicationData.cancellationPolicy,
      panNumber: applicationData.panNumber,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return Response.json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields 
      }, { status: 400 });
    }

    if (!applicationData.agreeToTerms) {
      return Response.json({ 
        message: 'Terms and conditions must be accepted',
      }, { status: 400 });
    }

    if (!paymentData.razorpayPaymentId || paymentData.amount < 10000) {
      return Response.json({ message: 'Invalid payment information' }, { status: 400 });
    }

    if (!applicationData.vehicles || applicationData.vehicles.length === 0) {
      return Response.json({ 
        message: 'At least one vehicle must be added',
      }, { status: 400 });
    }

    interface Vehicle {
        type: string;
        model: string;
        year: string;
        capacity: string;
        registrationNumber: string;
        insuranceExpiry: string;
        fitnessExpiry: string;
        [key: string]: string; 
      }
      
      interface ApplicationData {
        vehicles: Vehicle[];
      }
      
      const vehicleValidationErrors: string[] = [];
      
      applicationData.vehicles.forEach((vehicle:any, index:any) => {
        const requiredVehicleFields: (keyof Vehicle)[] = [
          'type', 'model', 'year', 'capacity', 
          'registrationNumber', 'insuranceExpiry', 'fitnessExpiry'
        ];
      
        const missingVehicleFields = requiredVehicleFields.filter(
          field => !vehicle[field] || vehicle[field].trim() === ''
        );
      
        if (missingVehicleFields.length > 0) {
          vehicleValidationErrors.push(
            `Vehicle ${index + 1}: Missing ${missingVehicleFields.join(', ')}`
          );
        }
      });
      
      if (vehicleValidationErrors.length > 0) {
        return Response.json(
          { message: `Vehicle validation errors: ${vehicleValidationErrors.join('; ')}` },
          { status: 400 }
        );
      }
      

    const fileData = {
      businessLicense: formData.get('businessLicense') as File | null,
      drivingLicense: formData.get('drivingLicense') as File | null,
      vehicleRegistration: extractMultipleFiles(formData, 'vehicleRegistration'),
      insurance: extractMultipleFiles(formData, 'insurance'),
      fitnessCredential: extractMultipleFiles(formData, 'fitnessCredential'),
      vehiclePhotos: extractMultipleFiles(formData, 'vehiclePhotos'),
      panCard: formData.get('panCard') as File | null,
    };

    console.log('Extracted transportation files:', {
      businessLicense: fileData.businessLicense?.name,
      drivingLicense: fileData.drivingLicense?.name,
      vehicleRegistration: fileData.vehicleRegistration?.length,
      insurance: fileData.insurance?.length,
      fitnessCredential: fileData.fitnessCredential?.length,
      vehiclePhotos: fileData.vehiclePhotos?.length,
      panCard: fileData.panCard?.name,
    });

    const submissionService = new FormSubmissionService();
    console.log("Transportation submission data is ", userId, applicationData, fileData, paymentData.razorpayPaymentId, paymentData.amount);
    const result = await submissionService.submitForm(
      userId,
      applicationData,
      fileData,
      paymentData
    );
    
    console.log("Transportation result in the frontend is ", result);
    
    if (result.success) {
      const response: any = {
        success: true,
        applicationId: result.applicationId,
        message: result.message,
      };

      if (result.vendorId) {
        response.vendorId = result.vendorId;
      }
      if (result.blockchainTxHash) {
        response.blockchainTxHash = result.blockchainTxHash;
      }
      if (result.explorerUrl) {
        response.explorerUrl = result.explorerUrl;
      }
      if (result.registrationFee) {
        response.registrationFee = result.registrationFee;
      }
      if (result.documentHash) {
        response.documentHash = result.documentHash;
      }

      if (result.legacyApplicationId) {
        response.legacyApplicationId = result.legacyApplicationId;
      }
      response.legacyContractSuccess = result.legacyContractSuccess || false;
      console.log("Response from the api is ",response);
      return Response.json(response);
    } else {
      return Response.json({
        success: false,
        message: result.message,
        error: result.error,
      }, { status: 500 });
    }


  } catch (error: any) {
    console.error('Transportation API error:', error);
    return Response.json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }, { status: 500 });
  }
}

function extractMultipleFiles(formData: FormData, fieldName: string): FileList | null {
  const files: File[] = [];
  
  const entries = formData.getAll(fieldName);
  
  let index = 0;
  while (formData.has(`${fieldName}[${index}]`)) {
    const file = formData.get(`${fieldName}[${index}]`);
    if (file instanceof File && file.size > 0) {
      files.push(file);
    }
    index++;
  }
  
  for (const entry of entries) {
    if (entry instanceof File && entry.size > 0) {
      files.push(entry);
    }
  }

  if (files.length === 0) return null;

  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    *[Symbol.iterator]() {
      for (let i = 0; i < files.length; i++) {
        yield files[i];
      }
    },
  };

  files.forEach((file, index) => {
    (fileList as any)[index] = file;
  });

  return fileList as FileList;
}

export async function GET() {
  return Response.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return Response.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ message: 'Method not allowed' }, { status: 405 });
}