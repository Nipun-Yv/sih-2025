import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FormSubmissionService } from '@/utils/form-submission-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Entered the function of submitting hotel application", userId);
    
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
      pincode: getFormValue('pincode'),
      businessType: getFormValue('businessType'),
      establishedYear: getFormValue('establishedYear'),
      totalRooms: getFormValue('totalRooms'),
      roomTypes: JSON.parse(getFormValue('roomTypes') || '[]'),
      priceRange: getFormValue('priceRange'),
      amenities: JSON.parse(getFormValue('amenities') || '[]'),
      description: getFormValue('description'),
      websiteUrl: getFormValue('websiteUrl'),
      socialMediaLinks: getFormValue('socialMediaLinks'),
      operatingHours: getFormValue('operatingHours'),
      cancellationPolicy: getFormValue('cancellationPolicy'),
      checkInTime: getFormValue('checkInTime'),
      checkOutTime: getFormValue('checkOutTime'),
      gstNumber: getFormValue('gstNumber'),
      panNumber: getFormValue('panNumber'),
      agreeToTerms: getBooleanValue('agreeToTerms'),
    };
    
    console.log("Hotel application data is:", applicationData);
    const paymentData={
     razorpayPaymentId : getFormValue('razorpayPaymentId'),
     razorpayOrderId : getFormValue('razorpayOrderId'),
     razorpaySignature: getFormValue('razorpaySignature'),
     amount : parseInt(getFormValue('razorpayAmount') || '0')
  };
    const requiredFields = {
      businessName: applicationData.businessName,
      ownerName: applicationData.ownerName,
      email: applicationData.email,
      phone: applicationData.phone,
      address: applicationData.address,
      city: applicationData.city,
      pincode: applicationData.pincode,
      businessType: applicationData.businessType,
      establishedYear: applicationData.establishedYear,
      totalRooms: applicationData.totalRooms,
      priceRange: applicationData.priceRange,
      description: applicationData.description,
      cancellationPolicy: applicationData.cancellationPolicy,
      checkInTime: applicationData.checkInTime,
      checkOutTime: applicationData.checkOutTime,
      panNumber: applicationData.panNumber,
      gstNumber:applicationData.gstNumber
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

    if (!applicationData.roomTypes || applicationData.roomTypes.length === 0) {
      return Response.json({ 
        message: 'At least one room type must be selected',
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
      hotelPhotos: extractMultipleFiles(formData, 'hotelPhotos'),
      roomPhotos: extractMultipleFiles(formData, 'roomPhotos'),
      menuCard: formData.get('menuCard') as File | null,
      gstCertificate: formData.get('gstCertificate') as File | null,
      panCard: formData.get('panCard') as File | null,
    };

    if (!fileData.businessLicense) {
      return Response.json({ 
        message: 'Business license is required',
      }, { status: 400 });
    }

    if (!fileData.panCard) {
      return Response.json({ 
        message: 'PAN card is required',
      }, { status: 400 });
    }

    if (!fileData.hotelPhotos || fileData.hotelPhotos.length === 0) {
      return Response.json({ 
        message: 'Property photos are required',
      }, { status: 400 });
    }

    if (!fileData.roomPhotos || fileData.roomPhotos.length === 0) {
      return Response.json({ 
        message: 'Room photos are required',
      }, { status: 400 });
    }

    console.log('Extracted hotel files:', {
      businessLicense: fileData.businessLicense?.name,
      hotelPhotos: fileData.hotelPhotos?.length,
      roomPhotos: fileData.roomPhotos?.length,
      menuCard: fileData.menuCard?.name,
      gstCertificate: fileData.gstCertificate?.name,
      panCard: fileData.panCard?.name,
    });

    const submissionService = new FormSubmissionService();
    console.log("Hotel submission data is ", userId, applicationData, fileData, paymentData.razorpayPaymentId, paymentData.amount);
    
    const result = await submissionService.submitForm(
      userId,
      applicationData,
      fileData,
      paymentData
    );
    
    console.log("Hotel result in the frontend is ", result);
    
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
    console.error('Hotel API error:', error);
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