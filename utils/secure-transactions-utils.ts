import { ethers } from 'ethers';
import { RazorpayResponse,RazorpayOptions,verifyRazorpayPayment } from './razorpay';
export enum VendorType {
  GUIDE = 0,
  TRANSPORT = 1,
  FOOD_RESTAURANT = 2,
  ACTIVITY = 3,
  ACCOMMODATION = 4
}

export enum TransactionType {
  VENDOR_REGISTRATION = 0,
  TOUR_BOOKING = 1,
  SERVICE_PAYMENT = 2,
  PLATFORM_FEE = 3,
  VENDOR_TO_PLATFORM = 4,
  TOURIST_TO_PLATFORM = 5
}



const NETWORK_CONFIGS = {
  amoy: {
    chainId: 80002,
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
  },
  polygon: {
    chainId: 137,
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
  local: {
    chainId: 1337,
    chainName: 'Local Network',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: ['http://localhost:8545'],
  }
};

const  TRANSACTION_CONTRACT_ADDRESS = process.env.TRANSACTION_CONTRACT_ADDRESS || '';
const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK || 'amoy';

export interface BlockchainVendor {
  id: number;
  name: string;
  email: string;
  contactNumber: string;
  vendorType: VendorType;
  businessAddress: string;
  isActive: boolean;
  registrationTimestamp: number;
  registrationFeeAmount: number;
  razorpayRegistrationPaymentId: string;
  totalEarnings: number;
  platformFeesOwed: number;
}

export interface BlockchainTransaction {
  id: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  amount: number;
  currency: string;
  transactionType: TransactionType;
  vendorType: VendorType;
  vendorId: number;
  customerEmail: string;
  customerName: string;
  customerContact: string;
  timestamp: number;
  isVerified: boolean;
  description: string;
  dataHash: string;
  platformFee: number;
}

export interface PlatformStats {
  totalPlatformFees: number;
  totalVendors: number;
  totalTransactions: number;
  adminFundBalance: number;
}

export interface VendorRegistrationData {
  name: string;
  email: string;
  contactNumber: string;
  vendorType: VendorType;
  businessAddress: string;
  razorpayPaymentId: string;
}

export interface TransactionStoreData {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  amount: number;
  currency: string;
  transactionType: TransactionType;
  vendorType: VendorType;
  vendorId: number;
  customerEmail: string;
  customerName: string;
  customerContact: string;
  description: string;
}

export interface VendorToPlatformData {
  vendorId: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  amount: number;
  description: string;
}

export interface TouristToPlatformData {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerContact: string;
  description: string;
}

class AdminBlockchainService {
    private provider: ethers.JsonRpcProvider
    private contract: ethers.Contract | null = null;
    private adminWallet: ethers.Wallet | null = null;
    private networkConfig: any;
    private signer: ethers.Signer
  
    constructor() {
      this.networkConfig = NETWORK_CONFIGS[NETWORK_NAME as keyof typeof NETWORK_CONFIGS] || NETWORK_CONFIGS.local;
      this.provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL || "https://amoy.polygonscan.com/"
      )
      const privateKey = process.env.ADMIN_PRIVATE_KEY;
      if (!privateKey) throw new Error("Admin private key not found");
  
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(TRANSACTION_CONTRACT_ADDRESS, TOURISM_REGISTRY_ABI, this.signer);
    }
  
    private requireAdminWallet(): void {
      if (!this.signer || !this.contract) {
        
        throw new Error('Admin wallet not initialized. This function requires server-side execution with ADMIN_PRIVATE_KEY.');
      }
    }
  
    /**
     * Parse event from transaction receipt logs (Ethers v6 compatible)
     */
    private parseEventFromLogs(receipt: any, eventName: string): any | null {
      if (!receipt?.logs || receipt.logs.length === 0) {
        console.log(`No logs found in receipt for event: ${eventName}`);
        return null;
      }
  
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract!.interface.parseLog({
            topics: [...log.topics],
            data: log.data
          });
  
          console.log("Parsed log:", parsedLog);
  
          if (parsedLog && parsedLog.name === eventName) {
            console.log(`Found ${eventName} event:`, parsedLog.args);
            return parsedLog;
          }
        } catch (parseError: any) {
          console.log("Skipping unparseable log:", parseError.message);
          continue;
        }
      }
  
      console.log(`Event ${eventName} not found in logs`);
      return null;
    }
  
    async registerVendor(vendorData: VendorRegistrationData): Promise<{
      vendorId: number;
      blockchainTxHash: string;
      gasUsed: string;
      explorerUrl: string;
    }> {
      this.requireAdminWallet();
      try {
        console.log("Vendor details in the backend is ",vendorData)
        const tx = await this.contract!.registerVendor(
          vendorData.name,
          vendorData.email,
          vendorData.contactNumber,
          vendorData.vendorType,
          vendorData.businessAddress,
          vendorData.razorpayPaymentId,
        );
  
        console.log(`Vendor registration transaction sent: ${tx.hash}`);
  
        const receipt = await tx.wait();
        console.log("Receipt in registerVendor:", receipt);
  
        let vendorId: number = 0;
        const parsedEvent = this.parseEventFromLogs(receipt, 'VendorRegistered');
        
        if (parsedEvent && parsedEvent.args) {
          vendorId = Number(parsedEvent.args[0]);
          console.log("Found VendorRegistered event with ID:", vendorId);
        } else {
          console.log("Could not parse VendorRegistered event, trying alternative method...");
          
          try {
            const currentNextId = await this.contract!.getTotalVendors();
            vendorId = Number(currentNextId);
            console.log("Using calculated vendorId:", vendorId);
          } catch (fallbackError) {
            console.error("Fallback method failed:", fallbackError);
            throw new Error("Could not retrieve valid vendor ID");
          }
        }
  
        if (vendorId <= 0) {
          throw new Error("Could not retrieve valid vendor ID");
        }
  
        return {
          vendorId,
          blockchainTxHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString(),
          explorerUrl: this.getTransactionExplorerUrl(receipt.hash),
        };
      } catch (error) {
        console.error('Failed to register vendor on blockchain:', error);
        throw new Error(`Vendor registration failed: ${error}`);
      }
    }
  
    /**
     * Store general transaction on blockchain (admin only)
     */
    async storeTransaction(data: TransactionStoreData): Promise<{
      transactionId: number;
      blockchainTxHash: string;
      gasUsed: string;
      explorerUrl: string;
      platformFee: number;
    }> {
      this.requireAdminWallet();
      try {
        const platformFee = await this.calculatePlatformFee(data.amount);
  
        const tx = await this.contract!.storeTransaction(
          data.razorpayPaymentId,
          data.razorpayOrderId,
          data.razorpaySignature,
          data.amount,
          data.currency,
          data.transactionType,
          data.vendorType,
          data.vendorId,
          data.customerEmail,
          data.customerName,
          data.customerContact,
          data.description,
        );
  
        console.log(`Transaction storage sent: ${tx.hash}`);
  
        const receipt = await tx.wait();
        console.log("Receipt in storeTransaction:", receipt);
  
        let transactionId: number = 0;
        const parsedEvent = this.parseEventFromLogs(receipt, 'TransactionStored');
        
        if (parsedEvent && parsedEvent.args) {
          transactionId = Number(parsedEvent.args[0]);
          console.log("Found TransactionStored event with ID:", transactionId);
        } else {
          console.log("Could not parse TransactionStored event, trying alternative method...");
          
          try {
            const currentNextId = await this.contract!.getTotalTransactions();
            transactionId = Number(currentNextId);
            console.log("Using calculated transactionId:", transactionId);
          } catch (fallbackError) {
            console.error("Fallback method failed:", fallbackError);
            throw new Error("Could not retrieve valid transaction ID");
          }
        }
  
        if (transactionId <= 0) {
          throw new Error("Could not retrieve valid transaction ID");
        }
  
        return {
          transactionId,
          blockchainTxHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString(),
          explorerUrl: this.getTransactionExplorerUrl(receipt.hash),
          platformFee: platformFee,
        };
      } catch (error) {
        console.error('Failed to store transaction on blockchain:', error);
        throw new Error(`Transaction storage failed: ${error}`);
      }
    }
  
    /**
     * Store vendor-to-platform fee transaction (admin only)
     */
    async storeVendorToPlatformTransaction(data: VendorToPlatformData): Promise<{
      transactionId: number;
      blockchainTxHash: string;
      gasUsed: string;
      explorerUrl: string;
    }> {
      this.requireAdminWallet();
  
      try {
        const tx = await this.contract!.storeVendorToPlatformTransaction(
          data.vendorId,
          data.razorpayPaymentId,
          data.razorpayOrderId,
          data.razorpaySignature,
          data.amount,
          data.description,
        );
  
        console.log(`Vendor-to-platform transaction sent: ${tx.hash}`);
  
        const receipt = await tx.wait();
        console.log("Receipt in storeVendorToPlatformTransaction:", receipt);
  
        let transactionId: number = 0;
        const parsedEvent = this.parseEventFromLogs(receipt, 'TransactionStored');
        
        if (parsedEvent && parsedEvent.args) {
          transactionId = Number(parsedEvent.args[0]);
          console.log("Found TransactionStored event with ID:", transactionId);
        } else {
          console.log("Could not parse event, trying alternative method...");
          
          try {
            const currentNextId = await this.contract!.getTotalTransactions();
            transactionId = Number(currentNextId);
            console.log("Using calculated transactionId:", transactionId);
          } catch (fallbackError) {
            throw new Error("Could not retrieve valid transaction ID");
          }
        }
  
        if (transactionId <= 0) {
          throw new Error("Could not retrieve valid transaction ID");
        }
  
        return {
          transactionId,
          blockchainTxHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString(),
          explorerUrl: this.getTransactionExplorerUrl(receipt.hash),
        };
      } catch (error) {
        console.error('Failed to store vendor-to-platform transaction:', error);
        throw new Error(`Vendor-to-platform transaction failed: ${error}`);
      }
    }
  
    /**
     * Store tourist-to-platform fee transaction (admin only)
     */
    async storeTouristToPlatformTransaction(data: TouristToPlatformData): Promise<{
      transactionId: number;
      blockchainTxHash: string;
      gasUsed: string;
      explorerUrl: string;
    }> {
      this.requireAdminWallet();
  
      try {
        const tx = await this.contract!.storeTouristToPlatformTransaction(
          data.razorpayPaymentId,
          data.razorpayOrderId,
          data.razorpaySignature,
          data.amount,
          data.customerEmail,
          data.customerName,
          data.customerContact,
          data.description,
        );
  
        console.log(`Tourist-to-platform transaction sent: ${tx.hash}`);
  
        const receipt = await tx.wait();
        console.log("Receipt in storeTouristToPlatformTransaction:", receipt);
  
        let transactionId: number = 0;
        const parsedEvent = this.parseEventFromLogs(receipt, 'TransactionStored');
        
        if (parsedEvent && parsedEvent.args) {
          transactionId = Number(parsedEvent.args[0]);
          console.log("Found TransactionStored event with ID:", transactionId);
        } else {
          console.log("Could not parse event, trying alternative method...");
          
          try {
            const currentNextId = await this.contract!.getTotalTransactions();
            transactionId = Number(currentNextId);
            console.log("Using calculated transactionId:", transactionId);
          } catch (fallbackError) {
            throw new Error("Could not retrieve valid transaction ID");
          }
        }
  
        if (transactionId <= 0) {
          throw new Error("Could not retrieve valid transaction ID");
        }
  
        return {
          transactionId,
          blockchainTxHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString(),
          explorerUrl: this.getTransactionExplorerUrl(receipt.hash),
        };
      } catch (error) {
        console.error('Failed to store tourist-to-platform transaction:', error);
        throw new Error(`Tourist-to-platform transaction failed: ${error}`);
      }
    }
  
    /**
     * Calculate platform fee using contract function
     */
    async calculatePlatformFee(amount: number): Promise<number> {
      try {
        const fee = await this.contract!.calculatePlatformFee(amount);
        return Number(fee);
      } catch (error) {
        console.error('Failed to calculate platform fee:', error);
        throw error;
      }
    }
  
    /**
     * Get registration fee for vendor type
     */
    async getRegistrationFee(vendorType: VendorType): Promise<number> {
      try {
        const fee = await this.contract!.getRegistrationFee(vendorType);
        return Number(fee);
      } catch (error) {
        console.error('Failed to get registration fee:', error);
        throw error;
      }
    }
  
    /**
     * Get transaction by Razorpay payment ID
     */
    async getTransactionByPaymentId(paymentId: string): Promise<BlockchainTransaction> {
      try {
        const tx = await this.contract!.getTransactionByPaymentId(paymentId);
        return this.parseBlockchainTransaction(tx);
      } catch (error) {
        console.error('Failed to get transaction by payment ID:', error);
        throw error;
      }
    }
  
    /**
     * Get transaction by ID
     */
    async getTransaction(transactionId: number): Promise<BlockchainTransaction> {
      try {
        const tx = await this.contract!.getTransaction(transactionId);
        return this.parseBlockchainTransaction(tx);
      } catch (error) {
        console.error('Failed to get transaction:', error);
        throw error;
      }
    }
  
    /**
     * Get vendor by ID
     */
    async getVendor(vendorId: number): Promise<BlockchainVendor> {
      try {
        const vendor = await this.contract!.getVendor(vendorId);
        return this.parseBlockchainVendor(vendor);
      } catch (error) {
        console.error('Failed to get vendor:', error);
        throw error;
      }
    }
  
    /**
     * Get vendor by email
     */
    async getVendorByEmail(email: string): Promise<BlockchainVendor> {
      try {
        const vendor = await this.contract!.getVendorByEmail(email);
        return this.parseBlockchainVendor(vendor);
      } catch (error) {
        console.error('Failed to get vendor by email:', error);
        throw error;
      }
    }
  
    /**
     * Get all vendors by type
     */
    async getVendorsByType(vendorType: VendorType): Promise<number[]> {
      try {
        const vendorIds = await this.contract!.getVendorsByType(vendorType);
        return vendorIds.map((id: any) => Number(id));
      } catch (error) {
        console.error('Failed to get vendors by type:', error);
        throw error;
      }
    }
  
    async getVendorTransactionIds(vendorId: number): Promise<number[]> {
      try {
        const transactionIds = await this.contract!.getVendorTransactions(vendorId);
        return transactionIds.map((id: any) => Number(id));
      } catch (error) {
        console.error('Failed to get vendor transaction IDs:', error);
        throw error;
      }
    }
  
    async getVendorTransactions(vendorId: number): Promise<BlockchainTransaction[]> {
      try {
        const transactionIds = await this.getVendorTransactionIds(vendorId);
        
        const transactions = await Promise.all(
          transactionIds.map(async (id) => {
            try {
              return await this.getTransaction(id);
            } catch (error) {
              console.warn(`Failed to get transaction ${id} for vendor ${vendorId}:`, error);
              return null;
            }
          })
        );
  
        return transactions.filter((tx): tx is BlockchainTransaction => tx !== null);
      } catch (error) {
        console.error('Failed to get vendor transactions:', error);
        throw error;
      }
    }

    async getTransactionsByType(transactionType: TransactionType): Promise<number[]> {
      try {
        const transactionIds = await this.contract!.getTransactionsByType(transactionType);
        return transactionIds.map((id: any) => Number(id));
      } catch (error) {
        console.error('Failed to get transactions by type:', error);
        throw error;
      }
    }
  
    /**
     * Get vendor fees owed
     */
    async getVendorFeesOwed(vendorId: number): Promise<number> {
      try {
        const feesOwed = await this.contract!.getVendorFeesOwed(vendorId);
        return Number(feesOwed);
      } catch (error) {
        console.error('Failed to get vendor fees owed:', error);
        throw error;
      }
    }
  
    /**
     * Get platform statistics using contract function
     */
    async getPlatformStats(): Promise<PlatformStats> {
      try {
        const stats = await this.contract!.getPlatformStats();
        return {
          totalPlatformFees: Number(stats.fees),
          totalVendors: Number(stats.vendorsCount),
          totalTransactions: Number(stats.txCount),
          adminFundBalance: parseFloat(ethers.formatEther(stats.adminBal)),
        };
      } catch (error) {
        console.error('Failed to get platform stats:', error);
        throw error;
      }
    }
  
    /**
     * Get total transactions count
     */
    async getTotalTransactions(): Promise<number> {
      try {
        const total = await this.contract!.getTotalTransactions();
        return Number(total);
      } catch (error) {
        console.error('Failed to get total transactions:', error);
        throw error;
      }
    }
  
    /**
     * Get total vendors count
     */
    async getTotalVendors(): Promise<number> {
      try {
        const total = await this.contract!.getTotalVendors();
        return Number(total);
      } catch (error) {
        console.error('Failed to get total vendors:', error);
        throw error;
      }
    }
  
    /**
     * Check if vendor email is registered
     */
    async isVendorEmailRegistered(email: string): Promise<boolean> {
      try {
        const isRegistered = await this.contract!.isVendorEmailRegistered(email);
        return isRegistered;
      } catch (error) {
        console.error('Failed to check vendor email registration:', error);
        throw error;
      }
    }
  
    /**
     * Admin: Verify transaction
     */
    async verifyTransaction(transactionId: number, isVerified: boolean): Promise<{
      blockchainTxHash: string;
      gasUsed: string;
      explorerUrl: string;
    }> {
      this.requireAdminWallet();
  
      try {
        const tx = await this.contract!.verifyTransaction(transactionId, isVerified);
        const receipt = await tx.wait();
  
        return {
          blockchainTxHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString(),
          explorerUrl: this.getTransactionExplorerUrl(receipt.hash),
        };
      } catch (error) {
        console.error('Failed to verify transaction:', error);
        throw error;
      }
    }
  
    /**
     * Admin: Update vendor status
     */
    async updateVendorStatus(vendorId: number, isActive: boolean): Promise<{
      blockchainTxHash: string;
      gasUsed: string;
      explorerUrl: string;
    }> {
      this.requireAdminWallet();
  
      try {
        const tx = await this.contract!.updateVendorStatus(vendorId, isActive);
        const receipt = await tx.wait();
  
        return {
          blockchainTxHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString(),
          explorerUrl: this.getTransactionExplorerUrl(receipt.hash),
        };
      } catch (error) {
        console.error('Failed to update vendor status:', error);
        throw error;
      }
    }
  
    /**
     * Admin: Update platform fee percentage
     */
    async updatePlatformFeePercentage(basisPoints: number): Promise<{
      blockchainTxHash: string;
      gasUsed: string;
      explorerUrl: string;
    }> {
      this.requireAdminWallet();
  
      try {
        if (basisPoints > 1000) {
          throw new Error('Platform fee cannot exceed 10% (1000 basis points)');
        }
  
        const tx = await this.contract!.updatePlatformFeePercentage(basisPoints);
        const receipt = await tx.wait();
  
        return {
          blockchainTxHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString(),
          explorerUrl: this.getTransactionExplorerUrl(receipt.hash),
        };
      } catch (error) {
        console.error('Failed to update platform fee percentage:', error);
        throw error;
      }
    }
  
    /**
     * Parse blockchain transaction data
     */
    private parseBlockchainTransaction(tx: any): BlockchainTransaction {
      return {
        id: Number(tx.id),
        razorpayPaymentId: tx.razorpayPaymentId,
        razorpayOrderId: tx.razorpayOrderId,
        razorpaySignature: tx.razorpaySignature,
        amount: Number(tx.amount),
        currency: tx.currency,
        transactionType: tx.transactionType,
        vendorType: tx.vendorType,
        vendorId: Number(tx.vendorId),
        customerEmail: tx.customerEmail,
        customerName: tx.customerName,
        customerContact: tx.customerContact,
        timestamp: Number(tx.timestamp),
        isVerified: tx.isVerified,
        description: tx.description,
        dataHash: tx.dataHash,
        platformFee: Number(tx.platformFee),
      };
    }
    private parseBlockchainVendor(vendor: any): BlockchainVendor {
      return {
        id: Number(vendor.id),
        name: vendor.name,
        email: vendor.email,
        contactNumber: vendor.contactNumber,
        vendorType: vendor.vendorType,
        businessAddress: vendor.businessAddress,
        isActive: vendor.isActive,
        registrationTimestamp: Number(vendor.registrationTimestamp),
        registrationFeeAmount: Number(vendor.registrationFeeAmount),
        razorpayRegistrationPaymentId: vendor.razorpayRegistrationPaymentId,
        totalEarnings: Number(vendor.totalEarnings),
        platformFeesOwed: Number(vendor.platformFeesOwed),
      };
    }
  
    getTransactionExplorerUrl(txHash: string): string {
      return `${this.networkConfig.blockExplorerUrls[0]}tx/${txHash}`;
    }
    getContractExplorerUrl(): string {
      return `${this.networkConfig.blockExplorerUrls[0]}address/${TRANSACTION_CONTRACT_ADDRESS}`;
    }
  
    getNetworkConfig() {
      return this.networkConfig;
    }
  
    getContractAddress(): string {
      return TRANSACTION_CONTRACT_ADDRESS;
    }
  }

export class TourismPlatformService {
  private blockchainService: AdminBlockchainService;

  constructor() {
    this.blockchainService = new AdminBlockchainService();
  }


  async processVendorRegistration(
    vendorData: Omit<VendorRegistrationData, 'razorpayPaymentId'> & {
      razorpayResponse: RazorpayResponse;
    }
  ): Promise<{
    vendorId: number;
    blockchainTxHash: string;
    registrationFee: number;
    explorerUrl: string;
  }> {
    try {
      const registrationFee = await this.blockchainService.getRegistrationFee(vendorData.vendorType);
    console.log("registration fees in the backend is",registrationFee)
      const blockchainResult = await this.blockchainService.registerVendor({
        ...vendorData,
        razorpayPaymentId: vendorData.razorpayResponse.razorpay_payment_id,
      });
      console.log("result is",blockchainResult)
      return {
        vendorId: blockchainResult.vendorId,
        blockchainTxHash: blockchainResult.blockchainTxHash,
        registrationFee,
        explorerUrl: blockchainResult.explorerUrl,
      };
    } catch (error) {
      console.error('Vendor registration failed:', error);
      throw error;
    }
  }

  /**
   * Process tourist service booking and payment
   */
  async processTouristServiceBooking(
    serviceData: {
      razorpayResponse: RazorpayResponse;
      amount: number;
      vendorId: number;
      customerEmail: string;
      customerName: string;
      customerContact: string;
      serviceDescription: string;
    }
  ): Promise<{
    transactionId: number;
    blockchainTxHash: string;
    vendorInfo: BlockchainVendor;
    platformFee: number;
    explorerUrl: string;
  }> {
    try {
      const vendor = await this.blockchainService.getVendor(serviceData.vendorId);
      
      if (!vendor.isActive) {
        throw new Error('Vendor is not active');
      }

      const verificationResult = await this.verifyRazorpayPayment({
        paymentId: serviceData.razorpayResponse.razorpay_payment_id,
        orderId: serviceData.razorpayResponse.razorpay_order_id,
        signature: serviceData.razorpayResponse.razorpay_signature,
        amount: serviceData.amount,
      });

      if (!verificationResult.verified) {
        throw new Error('Service payment verification failed');
      }

      const blockchainResult = await this.blockchainService.storeTransaction({
        razorpayPaymentId: serviceData.razorpayResponse.razorpay_payment_id,
        razorpayOrderId: serviceData.razorpayResponse.razorpay_order_id || '',
        razorpaySignature: serviceData.razorpayResponse.razorpay_signature || '',
        amount: serviceData.amount,
        currency: 'INR',
        transactionType: TransactionType.TOUR_BOOKING,
        vendorType: vendor.vendorType,
        vendorId: serviceData.vendorId,
        customerEmail: serviceData.customerEmail,
        customerName: serviceData.customerName,
        customerContact: serviceData.customerContact,
        description: serviceData.serviceDescription,
      });

      return {
        transactionId: blockchainResult.transactionId,
        blockchainTxHash: blockchainResult.blockchainTxHash,
        vendorInfo: vendor,
        platformFee: blockchainResult.platformFee,
        explorerUrl: blockchainResult.explorerUrl,
      };
    } catch (error) {
      console.error('Tourist service booking failed:', error);
      throw error;
    }
  }

  /**
   * Process service payment from platform to vendor
   */
  async processServicePaymentToVendor(
    paymentData: {
      razorpayResponse: RazorpayResponse;
      amount: number;
      vendorId: number;
      serviceDescription: string;
    }
  ): Promise<{
    transactionId: number;
    blockchainTxHash: string;
    vendorInfo: BlockchainVendor;
    explorerUrl: string;
  }> {
    try {
      const vendor = await this.blockchainService.getVendor(paymentData.vendorId);
      
      if (!vendor.isActive) {
        throw new Error('Vendor is not active');
      }

      const verificationResult = await this.verifyRazorpayPayment({
        paymentId: paymentData.razorpayResponse.razorpay_payment_id,
        orderId: paymentData.razorpayResponse.razorpay_order_id,
        signature: paymentData.razorpayResponse.razorpay_signature,
        amount: paymentData.amount,
      });

      if (!verificationResult.verified) {
        throw new Error('Service payment verification failed');
      }

      const blockchainResult = await this.blockchainService.storeTransaction({
        razorpayPaymentId: paymentData.razorpayResponse.razorpay_payment_id,
        razorpayOrderId: paymentData.razorpayResponse.razorpay_order_id || '',
        razorpaySignature: paymentData.razorpayResponse.razorpay_signature || '',
        amount: paymentData.amount,
        currency: 'INR',
        transactionType: TransactionType.SERVICE_PAYMENT,
        vendorType: vendor.vendorType,
        vendorId: paymentData.vendorId,
        customerEmail: 'platform@tourism.com',
        customerName: 'Platform Payment',
        customerContact: '+91-1234567890',
        description: paymentData.serviceDescription,
      });

      return {
        transactionId: blockchainResult.transactionId,
        blockchainTxHash: blockchainResult.blockchainTxHash,
        vendorInfo: vendor,
        explorerUrl: blockchainResult.explorerUrl,
      };
    } catch (error) {
      console.error('Service payment to vendor failed:', error);
      throw error;
    }
  }

  /**
   * Process vendor-to-platform fee payment
   */
  async processVendorToPlatformFee(
    feeData: {
      razorpayResponse: RazorpayResponse;
      vendorId: number;
      amount: number;
      serviceDescription: string;
    }
  ): Promise<{
    transactionId: number;
    blockchainTxHash: string;
    vendorInfo: BlockchainVendor;
    explorerUrl: string;
  }> {
    try {
      const vendor = await this.blockchainService.getVendor(feeData.vendorId);
      const feesOwed = await this.blockchainService.getVendorFeesOwed(feeData.vendorId);

      if (feeData.amount > feesOwed) {
        throw new Error(`Payment amount (₹${feeData.amount / 100}) exceeds fees owed (₹${feesOwed / 100})`);
      }

      const verificationResult = await this.verifyRazorpayPayment({
        paymentId: feeData.razorpayResponse.razorpay_payment_id,
        orderId: feeData.razorpayResponse.razorpay_order_id,
        signature: feeData.razorpayResponse.razorpay_signature,
        amount: feeData.amount,
      });

      if (!verificationResult.verified) {
        throw new Error('Vendor fee payment verification failed');
      }

      const blockchainResult = await this.blockchainService.storeVendorToPlatformTransaction({
        vendorId: feeData.vendorId,
        razorpayPaymentId: feeData.razorpayResponse.razorpay_payment_id,
        razorpayOrderId: feeData.razorpayResponse.razorpay_order_id || '',
        razorpaySignature: feeData.razorpayResponse.razorpay_signature || '',
        amount: feeData.amount,
        description: feeData.serviceDescription,
      });

      return {
        transactionId: blockchainResult.transactionId,
        blockchainTxHash: blockchainResult.blockchainTxHash,
        vendorInfo: vendor,
        explorerUrl: blockchainResult.explorerUrl,
      };
    } catch (error) {
      console.error('Vendor-to-platform fee payment failed:', error);
      throw error;
    }
  }

  /**
   * Process tourist-to-platform fee payment
   */
  async processTouristToPlatformFee(
    feeData: {
      razorpayResponse: RazorpayResponse;
      amount: number;
      customerEmail: string;
      customerName: string;
      customerContact: string;
      serviceDescription: string;
    }
  ): Promise<{
    transactionId: number;
    blockchainTxHash: string;
    explorerUrl: string;
  }> {
    try {
      const verificationResult = await this.verifyRazorpayPayment({
        paymentId: feeData.razorpayResponse.razorpay_payment_id,
        orderId: feeData.razorpayResponse.razorpay_order_id,
        signature: feeData.razorpayResponse.razorpay_signature,
        amount: feeData.amount,
      });

      if (!verificationResult.verified) {
        throw new Error('Tourist fee payment verification failed');
      }

      const blockchainResult = await this.blockchainService.storeTouristToPlatformTransaction({
        razorpayPaymentId: feeData.razorpayResponse.razorpay_payment_id,
        razorpayOrderId: feeData.razorpayResponse.razorpay_order_id || '',
        razorpaySignature: feeData.razorpayResponse.razorpay_signature || '',
        amount: feeData.amount,
        customerEmail: feeData.customerEmail,
        customerName: feeData.customerName,
        customerContact: feeData.customerContact,
        description: feeData.serviceDescription,
      });

      return {
        transactionId: blockchainResult.transactionId,
        blockchainTxHash: blockchainResult.blockchainTxHash,
        explorerUrl: blockchainResult.explorerUrl,
      };
    } catch (error) {
      console.error('Tourist-to-platform fee payment failed:', error);
      throw error;
    }
  }

  async getTransactionVerification(paymentId: string): Promise<{
    transaction: BlockchainTransaction;
    vendor?: BlockchainVendor;
    explorerUrl: string;
    isVerified: boolean;
  }> {
    try {
      const transaction = await this.blockchainService.getTransactionByPaymentId(paymentId);
      let vendor: BlockchainVendor | undefined;

      if (transaction.vendorId > 0) {
        vendor = await this.blockchainService.getVendor(transaction.vendorId);
      }

      return {
        transaction,
        vendor,
        explorerUrl: this.blockchainService.getTransactionExplorerUrl(transaction.dataHash),
        isVerified: transaction.isVerified,
      };
    } catch (error) {
      console.error('Transaction verification failed:', error);
      throw error;
    }
  }

  /**
   * Get vendor dashboard data
   */
  async getVendorDashboard(vendorId: number): Promise<{
    vendor: BlockchainVendor;
    transactions: BlockchainTransaction[];
    totalEarnings: number;
    platformFeesOwed: number;
    transactionStats: {
      totalBookings: number;
      totalPayments: number;
      totalFeesPaid: number;
    };
  }> {
    try {
      const [vendor, transactions, feesOwed] = await Promise.all([
        this.blockchainService.getVendor(vendorId),
        this.blockchainService.getVendorTransactions(vendorId),
        this.blockchainService.getVendorFeesOwed(vendorId),
      ]);

      const transactionStats = {
        totalBookings: transactions.filter(tx => tx.transactionType === TransactionType.TOUR_BOOKING).length,
        totalPayments: transactions.filter(tx => tx.transactionType === TransactionType.SERVICE_PAYMENT).length,
        totalFeesPaid: transactions.filter(tx => tx.transactionType === TransactionType.VENDOR_TO_PLATFORM).length,
      };

      return {
        vendor,
        transactions,
        totalEarnings: vendor.totalEarnings,
        platformFeesOwed: feesOwed,
        transactionStats,
      };
    } catch (error) {
      console.error('Failed to get vendor dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get platform analytics dashboard
   */
  async getPlatformAnalytics(): Promise<{
    stats: PlatformStats;
    vendorTypeBreakdown: {
      [key in VendorType]: {
        count: number;
        activeCount: number;
        totalEarnings: number;
        platformFees: number;
      };
    };
    transactionTypeBreakdown: {
      [key in TransactionType]: {
        count: number;
        totalAmount: number;
      };
    };
    recentTransactions: BlockchainTransaction[];
  }> {
    try {
      const stats = await this.blockchainService.getPlatformStats();

      const vendorTypeBreakdown = {
        [VendorType.GUIDE]: { count: 0, activeCount: 0, totalEarnings: 0, platformFees: 0 },
        [VendorType.TRANSPORT]: { count: 0, activeCount: 0, totalEarnings: 0, platformFees: 0 },
        [VendorType.FOOD_RESTAURANT]: { count: 0, activeCount: 0, totalEarnings: 0, platformFees: 0 },
        [VendorType.ACTIVITY]: { count: 0, activeCount: 0, totalEarnings: 0, platformFees: 0 },
        [VendorType.ACCOMMODATION]: { count: 0, activeCount: 0, totalEarnings: 0, platformFees: 0 },
      };

      const transactionTypeBreakdown = {
        [TransactionType.VENDOR_REGISTRATION]: { count: 0, totalAmount: 0 },
        [TransactionType.TOUR_BOOKING]: { count: 0, totalAmount: 0 },
        [TransactionType.SERVICE_PAYMENT]: { count: 0, totalAmount: 0 },
        [TransactionType.PLATFORM_FEE]: { count: 0, totalAmount: 0 },
        [TransactionType.VENDOR_TO_PLATFORM]: { count: 0, totalAmount: 0 },
        [TransactionType.TOURIST_TO_PLATFORM]: { count: 0, totalAmount: 0 },
      };

      for (const vendorType of Object.values(VendorType).filter(v => typeof v === 'number') as VendorType[]) {
        try {
          const vendorIds = await this.blockchainService.getVendorsByType(vendorType);
          vendorTypeBreakdown[vendorType].count = vendorIds.length;

          for (const vendorId of vendorIds) {
            try {
              const vendor = await this.blockchainService.getVendor(vendorId);
              if (vendor.isActive) {
                vendorTypeBreakdown[vendorType].activeCount++;
              }
              vendorTypeBreakdown[vendorType].totalEarnings += vendor.totalEarnings;
              vendorTypeBreakdown[vendorType].platformFees += vendor.platformFeesOwed;
            } catch (error) {
              console.warn(`Failed to get vendor ${vendorId} details:`, error);
            }
          }
        } catch (error) {
          console.warn(`Failed to get vendors for type ${vendorType}:`, error);
        }
      }

      for (const txType of Object.values(TransactionType).filter(v => typeof v === 'number') as TransactionType[]) {
        try {
          const transactionIds = await this.blockchainService.getTransactionsByType(txType);
          transactionTypeBreakdown[txType].count = transactionIds.length;

          for (const txId of transactionIds.slice(0, 100)) { 
            try {
              const transaction = await this.blockchainService.getTransaction(txId);
              transactionTypeBreakdown[txType].totalAmount += transaction.amount;
            } catch (error) {
              console.warn(`Failed to get transaction ${txId} details:`, error);
            }
          }
        } catch (error) {
          console.warn(`Failed to get transactions for type ${txType}:`, error);
        }
      }

      const recentTransactions: BlockchainTransaction[] = [];
      const totalTransactions = stats.totalTransactions;
      const startId = Math.max(1, totalTransactions - 9);

      for (let i = totalTransactions; i >= startId; i--) {
        try {
          const transaction = await this.blockchainService.getTransaction(i);
          recentTransactions.push(transaction);
        } catch (error) {
          console.warn(`Failed to get recent transaction ${i}:`, error);
        }
      }

      return {
        stats,
        vendorTypeBreakdown,
        transactionTypeBreakdown,
        recentTransactions,
      };
    } catch (error) {
      console.error('Failed to get platform analytics:', error);
      throw error;
    }
  }

  /**
   * Get vendor type statistics
   */
  async getVendorTypeStats(): Promise<{
    [key in VendorType]: {
      name: string;
      count: number;
      registrationFee: number;
    };
  }> {
    try {
      const vendorTypeNames = {
        [VendorType.GUIDE]: 'Guide',
        [VendorType.TRANSPORT]: 'Transport',
        [VendorType.FOOD_RESTAURANT]: 'Food & Restaurant',
        [VendorType.ACTIVITY]: 'Activity',
        [VendorType.ACCOMMODATION]: 'Accommodation',
      };

      const stats = {} as any;

      for (const [key, vendorType] of Object.entries(VendorType).filter(([k, v]) => typeof v === 'number')) {
        const vendorIds = await this.blockchainService.getVendorsByType(vendorType as VendorType);
        const registrationFee = await this.blockchainService.getRegistrationFee(vendorType as VendorType);

        stats[vendorType] = {
          name: vendorTypeNames[vendorType as VendorType],
          count: vendorIds.length,
          registrationFee,
        };
      }

      return stats;
    } catch (error) {
      console.error('Failed to get vendor type stats:', error);
      throw error;
    }
  }

  /**
   * Search transactions by various criteria
   */
  async searchTransactions(criteria: {
    paymentId?: string;
    vendorId?: number;
    customerEmail?: string;
    transactionType?: TransactionType;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<BlockchainTransaction[]> {
    try {
      let transactions: BlockchainTransaction[] = [];

      if (criteria.paymentId) {
        const transaction = await this.blockchainService.getTransactionByPaymentId(criteria.paymentId);
        transactions = [transaction];
      } else if (criteria.vendorId) {
        transactions = await this.blockchainService.getVendorTransactions(criteria.vendorId);
      } else if (criteria.transactionType !== undefined) {
        const transactionIds = await this.blockchainService.getTransactionsByType(criteria.transactionType);
        transactions = await Promise.all(
          transactionIds.map(id => this.blockchainService.getTransaction(id))
        );
      } else {
        const totalTransactions = await this.blockchainService.getTotalTransactions();
        const allTransactionIds = Array.from({ length: totalTransactions }, (_, i) => i + 1);
        
        transactions = await Promise.all(
          allTransactionIds.map(async (id) => {
            try {
              return await this.blockchainService.getTransaction(id);
            } catch (error) {
              console.warn(`Failed to get transaction ${id}:`, error);
              return null;
            }
          })
        ).then(results => results.filter((tx): tx is BlockchainTransaction => tx !== null));
      }

      return transactions.filter(tx => {
        if (criteria.customerEmail && !tx.customerEmail.toLowerCase().includes(criteria.customerEmail.toLowerCase())) {
          return false;
        }
        if (criteria.startDate && tx.timestamp < Math.floor(criteria.startDate.getTime() / 1000)) {
          return false;
        }
        if (criteria.endDate && tx.timestamp > Math.floor(criteria.endDate.getTime() / 1000)) {
          return false;
        }
        if (criteria.minAmount && tx.amount < criteria.minAmount) {
          return false;
        }
        if (criteria.maxAmount && tx.amount > criteria.maxAmount) {
          return false;
        }
        return true;
      });
    } catch (error) {
      console.error('Transaction search failed:', error);
      throw error;
    }
  }


  getBlockchainService(): AdminBlockchainService {
    return this.blockchainService;
  }

  private async verifyRazorpayPayment(data: {
    paymentId: string;
    orderId?: string;
    signature?: string;
    amount: number;
  }): Promise<{ verified: boolean; message?: string }> {
    try{
        return await verifyRazorpayPayment(data);
    }catch(error){
        console.error("Razorpay verification failed: ",error);
        return {
            verified:false,
            message:(error as Error).message
        }
    }
  }
}

export const VendorTypeLabels = {
  [VendorType.GUIDE]: 'GUIDE',
  [VendorType.TRANSPORT]: 'TRANSPORT',
  [VendorType.FOOD_RESTAURANT]: 'FOOD_RESTAURANT',
  [VendorType.ACTIVITY]: 'ACTIVITY',
  [VendorType.ACCOMMODATION]: 'ACCOMMODATION',
};

export const TransactionTypeLabels = {
  [TransactionType.VENDOR_REGISTRATION]: 'Vendor Registration',
  [TransactionType.TOUR_BOOKING]: 'Tour Booking',
  [TransactionType.SERVICE_PAYMENT]: 'Service Payment',
  [TransactionType.PLATFORM_FEE]: 'Platform Fee',
  [TransactionType.VENDOR_TO_PLATFORM]: 'Vendor Fee Payment',
  [TransactionType.TOURIST_TO_PLATFORM]: 'Tourist Fee Payment',
};

export { AdminBlockchainService };

const TOURISM_REGISTRY_ABI = 
    [
        {
          "inputs": [],
          "stateMutability": "payable",
          "type": "constructor"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "OwnableInvalidOwner",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "OwnableUnauthorizedAccount",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "ReentrancyGuardReentrantCall",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "funder",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "AdminFunded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "transactionId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "string",
              "name": "razorpayPaymentId",
              "type": "string"
            },
            {
              "indexed": true,
              "internalType": "enum TourismTransactionRegistry.TransactionType",
              "name": "transactionType",
              "type": "uint8"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "vendorId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "platformFee",
              "type": "uint256"
            }
          ],
          "name": "TransactionStored",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "razorpayPaymentId",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "verified",
              "type": "bool"
            }
          ],
          "name": "TransactionVerified",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "vendorId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "string",
              "name": "email",
              "type": "string"
            },
            {
              "indexed": true,
              "internalType": "enum TourismTransactionRegistry.VendorType",
              "name": "vendorType",
              "type": "uint8"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "registrationFee",
              "type": "uint256"
            }
          ],
          "name": "VendorRegistered",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "vendorId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            }
          ],
          "name": "VendorStatusUpdated",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "adminFundBalance",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "calculatePlatformFee",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "emergencyWithdraw",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "fundContract",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getPlatformStats",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "fees",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "vendorsCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "txCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "adminBal",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "enum TourismTransactionRegistry.VendorType",
              "name": "vType",
              "type": "uint8"
            }
          ],
          "name": "getRegistrationFee",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getTotalTransactions",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getTotalVendors",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            }
          ],
          "name": "getTransaction",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "razorpayPaymentId",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "razorpayOrderId",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "razorpaySignature",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "currency",
                  "type": "string"
                },
                {
                  "internalType": "enum TourismTransactionRegistry.TransactionType",
                  "name": "transactionType",
                  "type": "uint8"
                },
                {
                  "internalType": "enum TourismTransactionRegistry.VendorType",
                  "name": "vendorType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "vendorId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "customerEmail",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "customerName",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "customerContact",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "timestamp",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "isVerified",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "bytes32",
                  "name": "dataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint256",
                  "name": "platformFee",
                  "type": "uint256"
                }
              ],
              "internalType": "struct TourismTransactionRegistry.Transaction",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "pid",
              "type": "string"
            }
          ],
          "name": "getTransactionByPaymentId",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "razorpayPaymentId",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "razorpayOrderId",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "razorpaySignature",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "currency",
                  "type": "string"
                },
                {
                  "internalType": "enum TourismTransactionRegistry.TransactionType",
                  "name": "transactionType",
                  "type": "uint8"
                },
                {
                  "internalType": "enum TourismTransactionRegistry.VendorType",
                  "name": "vendorType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "vendorId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "customerEmail",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "customerName",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "customerContact",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "timestamp",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "isVerified",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "bytes32",
                  "name": "dataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint256",
                  "name": "platformFee",
                  "type": "uint256"
                }
              ],
              "internalType": "struct TourismTransactionRegistry.Transaction",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "enum TourismTransactionRegistry.TransactionType",
              "name": "tType",
              "type": "uint8"
            }
          ],
          "name": "getTransactionsByType",
          "outputs": [
            {
              "internalType": "uint256[]",
              "name": "",
              "type": "uint256[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            }
          ],
          "name": "getVendor",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "email",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "contactNumber",
                  "type": "string"
                },
                {
                  "internalType": "enum TourismTransactionRegistry.VendorType",
                  "name": "vendorType",
                  "type": "uint8"
                },
                {
                  "internalType": "string",
                  "name": "businessAddress",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "isActive",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "registrationTimestamp",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "registrationFeeAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "razorpayRegistrationPaymentId",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "totalEarnings",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "platformFeesOwed",
                  "type": "uint256"
                }
              ],
              "internalType": "struct TourismTransactionRegistry.Vendor",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "email_",
              "type": "string"
            }
          ],
          "name": "getVendorByEmail",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "email",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "contactNumber",
                  "type": "string"
                },
                {
                  "internalType": "enum TourismTransactionRegistry.VendorType",
                  "name": "vendorType",
                  "type": "uint8"
                },
                {
                  "internalType": "string",
                  "name": "businessAddress",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "isActive",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "registrationTimestamp",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "registrationFeeAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "razorpayRegistrationPaymentId",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "totalEarnings",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "platformFeesOwed",
                  "type": "uint256"
                }
              ],
              "internalType": "struct TourismTransactionRegistry.Vendor",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            }
          ],
          "name": "getVendorFeesOwed",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            }
          ],
          "name": "getVendorTransactions",
          "outputs": [
            {
              "internalType": "uint256[]",
              "name": "",
              "type": "uint256[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "enum TourismTransactionRegistry.VendorType",
              "name": "vType",
              "type": "uint8"
            }
          ],
          "name": "getVendorsByType",
          "outputs": [
            {
              "internalType": "uint256[]",
              "name": "",
              "type": "uint256[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "email_",
              "type": "string"
            }
          ],
          "name": "isVendorEmailRegistered",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "name": "paymentIdToTransactionId",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "platformFeePercentage",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "name_",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "email_",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "contact_",
              "type": "string"
            },
            {
              "internalType": "enum TourismTransactionRegistry.VendorType",
              "name": "vType",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "businessAddr",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "razorpayPid",
              "type": "string"
            }
          ],
          "name": "registerVendor",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "enum TourismTransactionRegistry.VendorType",
              "name": "",
              "type": "uint8"
            }
          ],
          "name": "registrationFees",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "pid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "oid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "sig",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "email",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "contact",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "desc",
              "type": "string"
            }
          ],
          "name": "storeTouristToPlatformTransaction",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "pid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "oid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "sig",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "currency",
              "type": "string"
            },
            {
              "internalType": "enum TourismTransactionRegistry.TransactionType",
              "name": "txType",
              "type": "uint8"
            },
            {
              "internalType": "enum TourismTransactionRegistry.VendorType",
              "name": "vType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "vendorId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "custEmail",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "custName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "custContact",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "desc",
              "type": "string"
            }
          ],
          "name": "storeTransaction",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "vendorId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "pid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "oid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "sig",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "desc",
              "type": "string"
            }
          ],
          "name": "storeVendorToPlatformTransaction",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "totalPlatformFees",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "transactions",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "razorpayPaymentId",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "razorpayOrderId",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "razorpaySignature",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "currency",
              "type": "string"
            },
            {
              "internalType": "enum TourismTransactionRegistry.TransactionType",
              "name": "transactionType",
              "type": "uint8"
            },
            {
              "internalType": "enum TourismTransactionRegistry.VendorType",
              "name": "vendorType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "vendorId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "customerEmail",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "customerName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "customerContact",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isVerified",
              "type": "bool"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "platformFee",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "enum TourismTransactionRegistry.TransactionType",
              "name": "",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "transactionsByType",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "bp",
              "type": "uint256"
            }
          ],
          "name": "updatePlatformFeePercentage",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "enum TourismTransactionRegistry.VendorType",
              "name": "vType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "fee",
              "type": "uint256"
            }
          ],
          "name": "updateRegistrationFee",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "active",
              "type": "bool"
            }
          ],
          "name": "updateVendorStatus",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "name": "vendorEmailToId",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "vendorTransactions",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "vendors",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "email",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "contactNumber",
              "type": "string"
            },
            {
              "internalType": "enum TourismTransactionRegistry.VendorType",
              "name": "vendorType",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "businessAddress",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "registrationTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "registrationFeeAmount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "razorpayRegistrationPaymentId",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "totalEarnings",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "platformFeesOwed",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "enum TourismTransactionRegistry.VendorType",
              "name": "",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "vendorsByType",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "ok",
              "type": "bool"
            }
          ],
          "name": "verifyTransaction",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "amt",
              "type": "uint256"
            }
          ],
          "name": "withdrawAdminFunds",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "stateMutability": "payable",
          "type": "receive"
        }
      ];