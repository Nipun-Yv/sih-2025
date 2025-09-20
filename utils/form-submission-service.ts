import { PinataIPFSService } from './ipfs-service';
import { TourismRegistryContract, mapVendorTypeToServiceType, hashPAN } from './contract-utils';
import { TourismPlatformService, VendorType } from './secure-transactions-utils';
import User from '@/models/User';
import Application from '@/models/Application';
import Document from '@/models/Document';
import Certificate from '@/models/Certificate';
import dbConnect from '@/lib/mongoose';

export interface FormSubmissionResult {
  success: boolean;
  applicationId?: string | number;
  message: string;
  error?: string;
  vendorId?: string;
  blockchainTxHash?: string;
  explorerUrl?: string;
  registrationFee?: string;
  documentHash?: string;
  legacyApplicationId?: string | number;
  legacyContractSuccess?: boolean;
}

export interface PaymentData {
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  amount: number;
}

export class FormSubmissionService {
  private ipfsService: PinataIPFSService;
  private contractService: TourismRegistryContract;
  private tourismPlatformService: TourismPlatformService;

  constructor() {
    this.ipfsService = new PinataIPFSService();
    this.contractService = new TourismRegistryContract();
    this.tourismPlatformService = new TourismPlatformService();
  }

  async submitForm(
    userId: string,
    formData: any,
    files: any,
    paymentData: PaymentData | string, 
    paymentAmount?: number 
  ): Promise<FormSubmissionResult> {
    try {
      await dbConnect();

      const user = await User.findOne({ clerkId: userId });
      if (!user) {
        throw new Error('User not found');
      }

      const vendorType = (user.vendorType || '').toUpperCase();
      console.log("vendortype is", vendorType);

      let processedPaymentData: PaymentData;
      if (typeof paymentData === 'string') {
        processedPaymentData = {
          razorpayPaymentId: paymentData,
          amount: paymentAmount || 0,
        };
      } else {
        processedPaymentData = paymentData;
      }

      if (!processedPaymentData.razorpayPaymentId || processedPaymentData.amount < 10000) {
        throw new Error('Invalid payment information');
      }

      return await this.submitWithDualBlockchain(userId, formData, files, processedPaymentData, vendorType, user);

    } catch (error: any) {
      console.error('Form submission error:', error);
      return {
        success: false,
        message: 'Failed to submit application',
        error: error.message,
      };
    }
  }


private async submitWithDualBlockchain(
  userId: string,
  formData: any,
  files: any,
  paymentData: PaymentData,
  vendorType: string,
  user: any
): Promise<FormSubmissionResult> {
  console.log('Using dual blockchain integration (new + legacy) for', vendorType);

  console.log('Uploading documents to IPFS using original method...');
  const { documentsHash, fileHashMap, photoHash } = await this.uploadDocuments(files, vendorType);
  console.log("Document hash is", documentsHash);
  console.log("File hash map:", Object.keys(fileHashMap));
  console.log("Photo hash:", photoHash);

  console.log('Uploading form data to IPFS...');
  const applicationDataHash = await this.uploadFormData(formData, vendorType);
  console.log("Application data hash is", applicationDataHash);

  console.log('Processing NEW blockchain registration...');
  let registrationResult;
  try {
    registrationResult = await this.tourismPlatformService.processVendorRegistration({
      name: formData.fullName || formData.businessName,
      email: formData.email,
      contactNumber: formData.phone,
      vendorType: this.mapToVendorType(vendorType),
      businessAddress: `${formData.address}`,
      razorpayResponse: {
        razorpay_payment_id: paymentData.razorpayPaymentId,
        razorpay_order_id: paymentData.razorpayOrderId || '',
        razorpay_signature: paymentData.razorpaySignature || '',
      },
    });

    console.log('NEW blockchain registration completed:', registrationResult);
    console.log('NEW blockchain TX hash:', registrationResult?.blockchainTxHash);
  } catch (blockchainError) {
    console.error('NEW blockchain registration failed:', blockchainError);
    registrationResult = null;
  }

  console.log('Processing LEGACY blockchain submission...');
  let legacyContractResult;
  try {
    const panHash = hashPAN(formData.panNumber);
    console.log("PAN hash for legacy contract:", panHash);

    legacyContractResult = await this.contractService.submitApplication(
      mapVendorTypeToServiceType(vendorType),
      panHash,
      applicationDataHash,
      documentsHash,
      paymentData.razorpayPaymentId,
      paymentData.amount
    );

    if (!legacyContractResult.success) {
      console.error('Legacy contract submission failed:', legacyContractResult.error);
      if (!registrationResult) {
        throw new Error(legacyContractResult.error || 'Both blockchain services failed');
      }
      console.warn('Legacy contract failed, but new blockchain succeeded');
    } else {
      console.log('LEGACY blockchain submission completed:', legacyContractResult);
    }
  } catch (legacyError) {
    console.error('Legacy blockchain submission failed:', legacyError);
    if (!registrationResult) {
      throw new Error('Both blockchain services failed');
    }
    legacyContractResult = null;
  }

  console.log('\n=== PREPARING DATABASE SAVE ===');
  
  const blockchainTxHash = registrationResult?.blockchainTxHash
                          
  
  const vendorIdValue = registrationResult?.vendorId
  
  const applicationIdValue = legacyContractResult?.success ? 
                            legacyContractResult.applicationId : 
                            registrationResult?.vendorId ||
                            Date.now(); 

  console.log('Extracted blockchain data:');
  console.log('- blockchainTxHash:', blockchainTxHash);
  console.log('- vendorIdValue:', vendorIdValue);
  console.log('- applicationIdValue:', applicationIdValue);

  const applicationData: any = {
    applicationId: applicationIdValue,
    user: user._id,
    vendorType,
    applicationDataHash,
    documentsHash,
    razorpayPaymentId: paymentData.razorpayPaymentId,
    razorpayAmount: paymentData.amount,
    status: 'pending',
  };

  if (blockchainTxHash && typeof blockchainTxHash === 'string' && blockchainTxHash.trim() !== '') {
    applicationData.blockchainTxHash = blockchainTxHash;
    console.log('✅ Added blockchainTxHash to application data:', applicationData.blockchainTxHash);
  } else {
    console.log('⚠️ No valid blockchainTxHash to save');
  }

  if (vendorIdValue) {
    applicationData.vendorId = vendorIdValue;
    console.log('✅ Added vendorId to application data:', applicationData.vendorId);
  }

  if (legacyContractResult?.success && formData.panNumber) {
    applicationData.panHash = hashPAN(formData.panNumber);
    console.log('✅ Added panHash to application data');
  }

  if (vendorType === 'GUIDE' && photoHash) {
    applicationData.photo = photoHash;
    console.log("✅ Added photo hash to application for GUIDE:", photoHash);
  } else if (vendorType === 'TRANSPORT' && formData.licenseNumber) {
    applicationData.licenseNumber = formData.licenseNumber;
    console.log("✅ Added license number to application for TRANSPORT:", formData.licenseNumber);
  } else if (vendorType !== 'GUIDE' && vendorType !== 'TRANSPORT' && formData.gstNumber) {
    applicationData.gstNumber = formData.gstNumber;
    console.log("✅ Added GST number to application:", formData.gstNumber);
  }

  console.log("\n=== FINAL APPLICATION DATA ===");
  console.log(JSON.stringify(applicationData, null, 2));

  let newApplication;
  try {
    console.log('\n=== SAVING TO DATABASE ===');
    
    const requiredFields = ['applicationId', 'user', 'vendorType', 'applicationDataHash', 'documentsHash', 'razorpayPaymentId', 'razorpayAmount'];
    for (const field of requiredFields) {
      if (!applicationData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    newApplication = await Application.create(applicationData);
    console.log('✅ Application saved successfully with ID:', newApplication._id);
    console.log('✅ Saved blockchainTxHash:', newApplication.blockchainTxHash);
    console.log('✅ Saved vendorId:', newApplication.vendorId);
    
  } catch (saveError: any) {
    console.error('❌ DATABASE SAVE ERROR:', saveError);
    if (saveError.errors) {
      console.error('❌ Validation errors:', saveError.errors);
      for (const [field, error] of Object.entries(saveError.errors)) {
        console.error(`  - ${field}:`, error);
      }
    }
    throw new Error(`Database save failed: ${saveError.message}`);
  }

  const savedDocuments: any[] = [];
  for (const [category, fileInfoArray] of Object.entries(fileHashMap)) {
    const files = Array.isArray(fileInfoArray) ? fileInfoArray : [fileInfoArray];
    
    for (const fileInfo of files) {
      const doc = await Document.create({
        application: newApplication._id,
        category,
        fileName: fileInfo.fileName,
        ipfsHash: fileInfo.hash,
      });
      savedDocuments.push(doc);
    }
  }

  user.registrationStatus = 'pending';
  user.applicationId = applicationData.applicationId;
  if (registrationResult?.vendorId) {
    user.vendorId = registrationResult.vendorId;
  }
  await user.save();

  const successMessage = registrationResult && legacyContractResult?.success
    ? `Application submitted to both blockchain services successfully.`
    : registrationResult
    ? `Application submitted to new blockchain service. Legacy contract submission failed.`
    : legacyContractResult?.success
    ? `Application submitted to legacy contract. New blockchain service failed.`
    : `Application partially submitted with errors.`;

  console.log(`✅ Successfully created dual blockchain application. New: ${registrationResult?.vendorId || 'failed'}, Legacy: ${legacyContractResult?.applicationId || 'failed'} with ${savedDocuments.length} documents`);

  const finalResponse = {
    success: true,
    applicationId: newApplication.applicationId?.toString(),
    vendorId: newApplication.vendorId,
    blockchainTxHash: newApplication.blockchainTxHash,
    explorerUrl: newApplication.blockchainTxHash ? 
      `https://amoy.polygonscan.com/tx/${newApplication.blockchainTxHash}` : 
      undefined,
    registrationFee: (paymentData.amount / 100).toString(), 
    documentHash: documentsHash,
    legacyApplicationId: legacyContractResult?.applicationId,
    legacyContractSuccess: legacyContractResult?.success || false,
    message: successMessage + ' You will receive updates via email.',
  };

  console.log('\n=== FINAL RESPONSE ===');
  console.log(JSON.stringify(finalResponse, null, 2));

  return finalResponse;
}

  private mapToVendorType(vendorType: string): VendorType {
    switch (vendorType.toUpperCase()) {
      case 'GUIDE': return VendorType.GUIDE;
      case 'TRANSPORT': return VendorType.TRANSPORT;
      case 'FOOD_RESTAURANT': return VendorType.FOOD_RESTAURANT;
      case 'ACTIVITY': return VendorType.ACTIVITY;
      case 'ACCOMMODATION': return VendorType.ACCOMMODATION;
      default: return VendorType.GUIDE;
    }
  }

  private isCertificateCategory(category: string): boolean {
    const certificateCategories = [
      'certificates',
      'safetyCredentials', 
      'instructorCredentials',
      'hygieneCredentials',
      'foodSafetyLicense',
      'businessLicense'
    ];
    return certificateCategories.includes(category);
  }

  private async uploadDocuments(files: any, vendorType: string): Promise<{
    documentsHash: string;
    fileHashMap: Record<string, Array<{ fileName: string; hash: string }>>;
    photoHash?: string;
  }> {
    console.log("=== DEBUG: Starting file processing ===");
    console.log("Raw files object:", files);
    console.log("Files object keys:", Object.keys(files));
    console.log("Vendor type:", vendorType);

    const filesToUpload: { file: File; category: string }[] = [];
    const fileHashMap: Record<string, Array<{ fileName: string; hash: string }>> = {};
    let photoHash: string | undefined;

    for (const [fieldName, fieldValue] of Object.entries(files)) {
      console.log(`\n--- Processing field: ${fieldName} ---`);
      console.log("Field value:", fieldValue);
      console.log("Field value type:", typeof fieldValue);
      console.log("Field value constructor:", fieldValue?.constructor?.name);
      console.log("Is File?", fieldValue instanceof File);
      console.log("Is Array?", Array.isArray(fieldValue));

      if (!fieldValue) {
        console.log(`Skipping ${fieldName}: null/undefined`);
        continue;
      }

      if (fieldValue instanceof File) {
        console.log(`✅ Found single file: ${fieldName} -> ${fieldValue.name}`);
        filesToUpload.push({ 
          file: fieldValue, 
          category: fieldName 
        });
      }
      else if (fieldValue && typeof fieldValue === 'object') {
        console.log(`Checking if ${fieldName} is FileList or Array...`);
        
        if ('length' in fieldValue && Number(fieldValue.length) > 0) {
          console.log(`${fieldName} has length: ${fieldValue.length}`);
          
          try {
            const fileArray = Array.from(fieldValue as FileList | File[]);
            console.log(`Converted to array, length: ${fileArray.length}`);
            
            for (let i = 0; i < fileArray.length; i++) {
              const file = fileArray[i];
              console.log(`  Item ${i}:`, file);
              console.log(`  Is File?`, file instanceof File);
              
              if (file instanceof File) {
                console.log(`✅ Found file in list: ${fieldName}[${i}] -> ${file.name}`);
                filesToUpload.push({ 
                  file, 
                  category: fieldName 
                });
              } else {
                console.log(`❌ Item ${i} is not a File:`, file);
              }
            }
          } catch (error) {
            console.log(`❌ Error converting ${fieldName} to array:`, error);
          }
        } else {
          console.log(`❌ ${fieldName} object has no length or length is 0`);
        }
      } else {
        console.log(`❌ Skipping ${fieldName}: not a File or object`);
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total files to upload: ${filesToUpload.length}`);
    filesToUpload.forEach((item, index) => {
      console.log(`${index + 1}. ${item.category}: ${item.file.name} (${item.file.size} bytes)`);
    });

    if (filesToUpload.length === 0) {
      console.log("❌ NO FILES TO UPLOAD! Check the file processing logic above.");
      return {
        documentsHash: await this.ipfsService.uploadJSON({ 
          uploadedAt: new Date().toISOString(), 
          documents: {} 
        }, `empty-documents-${Date.now()}`),
        fileHashMap: {},
        photoHash: undefined
      };
    }

    const documentManifest = {
      uploadedAt: new Date().toISOString(),
      documents: {} as any,
    };

    for (const { file, category } of filesToUpload) {
      console.log(`Uploading ${category}: ${file.name}`);
      const uploadedFile = await this.ipfsService.uploadFile(file);
      
      if (vendorType === 'GUIDE' && 
          (category.toLowerCase().includes('photo') || 
           file.name.toLowerCase().includes('photo') ||
           category === 'photo')) {
        photoHash = uploadedFile.hash;
        console.log(`🔹 Found photo for GUIDE: ${file.name} -> ${photoHash}`);
      }
      
      if (!documentManifest.documents[category]) {
        documentManifest.documents[category] = [];
      }
      documentManifest.documents[category].push(uploadedFile);

      if (!fileHashMap[category]) {
        fileHashMap[category] = [];
      }
      fileHashMap[category].push({
        fileName: file.name || 'unknown',
        hash: uploadedFile.hash
      });
    }

    const documentsHash = await this.ipfsService.uploadJSON(documentManifest, `documents-${Date.now()}`);
    
    return { documentsHash, fileHashMap, photoHash };
  }

  private async uploadFormData(formData: any, vendorType: string): Promise<string> {
    const applicationData = {
      vendorType,
      formData: {
        ...formData,
        panNumber: undefined,
      },
      submittedAt: new Date().toISOString(),
      version: '1.0',
    };

    return await this.ipfsService.uploadJSON(applicationData, `application-${Date.now()}`);
  }
}