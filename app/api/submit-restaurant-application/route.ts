import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FormSubmissionService } from '@/utils/form-submission-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Entered the function of submitting restaurant application", userId);
    
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
      businessType: getFormValue('businessType'),
      establishedYear: getFormValue('establishedYear'),
      cuisineTypes: JSON.parse(getFormValue('cuisineTypes') || '[]'),
      specialties: getFormValue('specialties'),
      seatingCapacity: getFormValue('seatingCapacity'),
      operatingHours: getFormValue('operatingHours'),
      deliveryService: getBooleanValue('deliveryService'),
      takeawayService: getBooleanValue('takeawayService'),
      cateringService: getBooleanValue('cateringService'),
      onlineOrdering: getBooleanValue('onlineOrdering'),
      facilities: JSON.parse(getFormValue('facilities') || '[]'),
      hygieneRating: getFormValue('hygieneRating'),
      staffCount: getFormValue('staffCount'),
      chefExperience: getFormValue('chefExperience'),
      averageMealPrice: getFormValue('averageMealPrice'),
      description: getFormValue('description'),
      foodSafetyLicense: getFormValue('foodSafetyLicense'),
      gstNumber: getFormValue('gstNumber'),
      panNumber: getFormValue('panNumber'),
      specialDiets: JSON.parse(getFormValue('specialDiets') || '[]'),
      paymentMethods: JSON.parse(getFormValue('paymentMethods') || '[]'),
      agreeToTerms: getBooleanValue('agreeToTerms'),
    };
    
    console.log("Restaurant application data is:", applicationData);

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
      businessType: applicationData.businessType,
      establishedYear: applicationData.establishedYear,
      description: applicationData.description,
      panNumber: applicationData.panNumber,
      gstNumber: applicationData.gstNumber,
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
      foodSafetyLicense: formData.get('foodSafetyLicense') as File | null,
      kitchenPhotos: extractMultipleFiles(formData, 'kitchenPhotos'),
      restaurantPhotos: extractMultipleFiles(formData, 'restaurantPhotos'),
      menuCard: extractMultipleFiles(formData, 'menuCard'),
      gstCertificate: formData.get('gstCertificate') as File | null,
      panCard: formData.get('panCard') as File | null,
      hygieneCredentials: extractMultipleFiles(formData, 'hygieneCredentials'),
    };

    console.log('Extracted restaurant files:', {
      businessLicense: fileData.businessLicense?.name,
      foodSafetyLicense: fileData.foodSafetyLicense?.name,
      kitchenPhotos: fileData.kitchenPhotos?.length,
      restaurantPhotos: fileData.restaurantPhotos?.length,
      menuCard: fileData.menuCard?.length,
      gstCertificate: fileData.gstCertificate?.name,
      panCard: fileData.panCard?.name,
      hygieneCredentials: fileData.hygieneCredentials?.length,
    });

    const submissionService = new FormSubmissionService();
    console.log("Restaurant submission data is ", userId, applicationData, fileData, paymentData.razorpayPaymentId,paymentData.amount);
    
    const result = await submissionService.submitForm(
      userId,
      applicationData,
      fileData,
      paymentData
    );
    
    console.log("Restaurant result in the frontend is ", result);
    
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
    console.error('Restaurant API error:', error);
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