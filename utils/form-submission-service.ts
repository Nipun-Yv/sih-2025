import { PinataIPFSService } from './ipfs-service';
import { TourismRegistryContract, mapVendorTypeToServiceType, hashPAN } from './contract-utils';
import User from '@/models/User';
import Application from '@/models/Application';
import Document from '@/models/Document';
import Certificate from '@/models/Certificate';
import dbConnect from '@/lib/mongoose';

export interface FormSubmissionResult {
  success: boolean;
  applicationId?: number;
  message: string;
  error?: string;
}

export class FormSubmissionService {
  private ipfsService: PinataIPFSService;
  private contractService: TourismRegistryContract;

  constructor() {
    this.ipfsService = new PinataIPFSService();
    this.contractService = new TourismRegistryContract();
  }

  async submitForm(
    userId: string,
    formData: any,
    files: any,
    razorpayPaymentId: string,
    razorpayAmount: number
  ): Promise<FormSubmissionResult> {
    try {
      await dbConnect();

      const user = await User.findOne({ clerkId: userId });
      if (!user) {
        throw new Error('User not found');
      }
      const vendorType = (user.vendorType || '').toUpperCase();
      console.log("vendortype is", vendorType);

      console.log('Uploading documents to IPFS...');
      const { documentsHash, fileHashMap } = await this.uploadDocuments(files);
      console.log("Document hash is", documentsHash);
      console.log("File hash map:", Object.keys(fileHashMap));

      console.log('Uploading form data to IPFS...');
      const applicationDataHash = await this.uploadFormData(formData, vendorType);
      console.log("Application data hash is", applicationDataHash);

      const panHash = hashPAN(formData.panNumber);
      console.log("Hash pan is", panHash);

      console.log('Submitting to smart contract...');
      const contractResult = await this.contractService.submitApplication(
        mapVendorTypeToServiceType(vendorType),
        panHash,
        applicationDataHash,
        documentsHash,
        razorpayPaymentId,
        razorpayAmount
      );

      if (!contractResult.success) {
        throw new Error(contractResult.error || 'Smart contract submission failed');
      }

      const newApplication = await Application.create({
        applicationId: contractResult.applicationId,
        user: user._id,
        vendorType,
        panHash,
        applicationDataHash,
        documentsHash,
        razorpayPaymentId,
        razorpayAmount,
        status: 'pending',
      });

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

          if (this.isCertificateCategory(category)) {
            await Certificate.create({
              application: newApplication._id,
              name: fileInfo.fileName || 'Certificate',
              issuingAuthority: formData.issuingAuthority || 'Unknown',
              issuedDate: formData.issuedDate ? new Date(formData.issuedDate) : undefined,
              expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
              ipfsHash: fileInfo.hash,
            });
          }
        }
      }

      user.registrationStatus = 'pending';
      user.applicationId = newApplication.applicationId;
      await user.save();

      console.log(`Successfully created application ${contractResult.applicationId} with ${savedDocuments.length} documents`);

      return {
        success: true,
        applicationId: contractResult.applicationId,
        message: 'Application submitted successfully. You will receive updates via email.',
      };

    } catch (error: any) {
      console.error('Form submission error:', error);
      return {
        success: false,
        message: 'Failed to submit application',
        error: error.message,
      };
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

private async uploadDocuments(files: any): Promise<{
  documentsHash: string;
  fileHashMap: Record<string, Array<{ fileName: string; hash: string }>>;
}> {
  console.log("=== DEBUG: Starting file processing ===");
  console.log("Raw files object:", files);
  console.log("Files object keys:", Object.keys(files));

  const filesToUpload: { file: File; category: string }[] = [];
  const fileHashMap: Record<string, Array<{ fileName: string; hash: string }>> = {};

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
      
      if ('length' in fieldValue && fieldValue.length > 0) {
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
      fileHashMap: {}
    };
  }

  const documentManifest = {
    uploadedAt: new Date().toISOString(),
    documents: {} as any,
  };

  for (const { file, category } of filesToUpload) {
    console.log(`Uploading ${category}: ${file.name}`);
    const uploadedFile = await this.ipfsService.uploadFile(file);
    
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
  
  return { documentsHash, fileHashMap };
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