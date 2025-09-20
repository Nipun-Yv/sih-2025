import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FormSubmissionService } from '@/utils/form-submission-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Entered the function of submitting application", userId);
    
    if (!userId) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const getFormValue = (key: string): string => {
      const value = formData.get(key);
      return value ? String(value).trim() : '';
    };

    const applicationData = {
      fullName: getFormValue('fullName'),
      email: getFormValue('email'),
      phone: getFormValue('phone'),
      address: getFormValue('address'),
      city: getFormValue('city'),
      state: getFormValue('state'),
      experience: getFormValue('experience'),
      specialization: getFormValue('specialization'),
      languages: JSON.parse(getFormValue('languages') || '[]'),
      certifications: getFormValue('certifications'),
      description: getFormValue('description'),
      emergencyContact: getFormValue('emergencyContact'),
      panNumber: getFormValue('panNumber'),
    };
    
    console.log("Application data is:", applicationData);

    const paymentData = {
      razorpayPaymentId: getFormValue('razorpayPaymentId'),
      razorpayOrderId: getFormValue('razorpayOrderId'),
      razorpaySignature: getFormValue('razorpaySignature'),
      amount: parseInt(getFormValue('razorpayAmount') || '0'),
    };

    console.log("Payment data is:", paymentData);

    const requiredFields = {
      fullName: applicationData.fullName,
      email: applicationData.email,
      phone: applicationData.phone,
      panNumber: applicationData.panNumber,
      specialization: applicationData.specialization,
      experience: applicationData.experience,
      description: applicationData.description,
      emergencyContact: applicationData.emergencyContact,
      address: applicationData.address,
      city: applicationData.city,
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

    if (!paymentData.razorpayPaymentId || paymentData.amount < 10000) {
      return Response.json({ message: 'Invalid payment information' }, { status: 400 });
    }

    const fileData = {
      photo: formData.get('photo') as File | null,
      idProof: formData.get('idProof') as File | null,
      certificates: extractMultipleFiles(formData, 'certificates'),
      experienceProof: extractMultipleFiles(formData, 'experienceProof'),
    };

    console.log('Extracted files:', {
      photo: fileData.photo?.name,
      idProof: fileData.idProof?.name,
      certificates: fileData.certificates?.length,
      experienceProof: fileData.experienceProof?.length,
    });

    const submissionService = new FormSubmissionService();
    console.log("Contract submission data is", userId, applicationData, fileData, paymentData);
    
    const result = await submissionService.submitForm(
      userId,
      applicationData,
      fileData,
      paymentData 
    );

    console.log("result in the frontend is", result);

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
    console.error('API error:', error);
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