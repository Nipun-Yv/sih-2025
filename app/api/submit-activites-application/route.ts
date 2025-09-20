import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FormSubmissionService } from '@/utils/form-submission-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Entered the function of submitting activity application", userId);
    
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
      alternatePhone: getFormValue('alternatePhone'),
      address: getFormValue('address'),
      city: getFormValue('city'),
      activityTypes: JSON.parse(getFormValue('activityTypes') || '[]'),
      experienceCategory: getFormValue('experienceCategory'),
      establishedYear: getFormValue('establishedYear'),
      groupSize: getFormValue('groupSize'),
      duration: getFormValue('duration'),
      ageRestriction: getFormValue('ageRestriction'),
      difficultyLevel: getFormValue('difficultyLevel'),
      seasonality: getFormValue('seasonality'),
      languages: JSON.parse(getFormValue('languages') || '[]'),
      pricing: getFormValue('pricing'),
      inclusions: getFormValue('inclusions'),
      exclusions: getFormValue('exclusions'),
      safetyMeasures: getFormValue('safetyMeasures'),
      equipmentProvided: JSON.parse(getFormValue('equipmentProvided') || '[]'),
      certifications: getFormValue('certifications'),
      staffCount: getFormValue('staffCount'),
      experience: getFormValue('experience'),
      description: getFormValue('description'),
      cancellationPolicy: getFormValue('cancellationPolicy'),
      weatherPolicy: getFormValue('weatherPolicy'),
      emergencyContact: getFormValue('emergencyContact'),
      emergencyPhone: getFormValue('emergencyPhone'),
      insuranceProvider: getFormValue('insuranceProvider'),
      operatingDays: JSON.parse(getFormValue('operatingDays') || '[]'),
      operatingHours: getFormValue('operatingHours'),
      bookingAdvance: getFormValue('bookingAdvance'),
      customPackages: getBooleanValue('customPackages'),
      privateGroups: getBooleanValue('privateGroups'),
      corporateEvents: getBooleanValue('corporateEvents'),
      wheelchairAccessible: getBooleanValue('wheelchairAccessible'),
      agreeToTerms: getBooleanValue('agreeToTerms'),

      gstNumber: getFormValue('gstNumber'),
    };
    
    console.log("Activity application data is:", applicationData);


    const paymentData={
      razorpayPaymentId:getFormValue('razorpayPaymentId'),
      razorpayOrderId:getFormValue('razorpayOrderId'),
      razorpaySignature:getFormValue('razorpaySignature'),
      amount:parseInt(getFormValue('razorpayAmount')||'0'),
    }
    console.log("Payment data is ",paymentData)

    const requiredFields: Record<string, string> = {
      businessName: applicationData.businessName,
      ownerName: applicationData.ownerName,
      email: applicationData.email,
      phone: applicationData.phone,
      address: applicationData.address,
      city: applicationData.city,
      experienceCategory: applicationData.experienceCategory,
      establishedYear: applicationData.establishedYear,
      description: applicationData.description,
      safetyMeasures: applicationData.safetyMeasures,
      pricing: applicationData.pricing,
      inclusions: applicationData.inclusions,
      cancellationPolicy: applicationData.cancellationPolicy,
      weatherPolicy: applicationData.weatherPolicy,
      emergencyContact: applicationData.emergencyContact,
      emergencyPhone: applicationData.emergencyPhone,
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

    const fileData = {
      businessLicense: formData.get('businessLicense') as File | null,
      safetyCredentials: extractMultipleFiles(formData, 'safetyCredentials'),
      instructorCredentials: extractMultipleFiles(formData, 'instructorCredentials'),
      equipmentPhotos: extractMultipleFiles(formData, 'equipmentPhotos'),
      activityPhotos: extractMultipleFiles(formData, 'activityPhotos'),
      insurance: formData.get('insurance') as File | null,
      panCard: formData.get('panCard') as File | null,
      testimonials: extractMultipleFiles(formData, 'testimonials'),
    };

    console.log('Extracted activity files:', {
      businessLicense: fileData.businessLicense?.name,
      safetyCredentials: fileData.safetyCredentials?.length,
      instructorCredentials: fileData.instructorCredentials?.length,
      equipmentPhotos: fileData.equipmentPhotos?.length,
      activityPhotos: fileData.activityPhotos?.length,
      insurance: fileData.insurance?.name,
      panCard: fileData.panCard?.name,
      testimonials: fileData.testimonials?.length,
    });

    const submissionService = new FormSubmissionService();
    console.log("Activity submission data is ", userId, applicationData, fileData);
    
    const result = await submissionService.submitForm(
      userId,
      applicationData,
      fileData,
      paymentData
    );
    
    console.log("Activity result in the frontend is ", result);
    
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
    console.error('Activity API error:', error);
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
