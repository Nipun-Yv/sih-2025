import { ethers } from 'ethers';
import crypto from 'crypto';

const TOURISM_REGISTRY_ABI = 
  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AccessControlBadConfirmation",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "neededRole",
          "type": "bytes32"
        }
      ],
      "name": "AccessControlUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "EnforcedPause",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExpectedPause",
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
          "internalType": "uint256",
          "name": "applicationId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum UnifiedTourismRegistry.ServiceType",
          "name": "serviceType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "panHash",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "razorpayPaymentId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "paymentAmount",
          "type": "uint256"
        }
      ],
      "name": "ApplicationSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "certificateHash",
          "type": "string"
        }
      ],
      "name": "CertificateGenerated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "admin",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "ContractFunded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        }
      ],
      "name": "ProfileUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum UnifiedTourismRegistry.ServiceType",
          "name": "serviceType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "panHash",
          "type": "string"
        }
      ],
      "name": "ProviderApproved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        }
      ],
      "name": "ProviderReactivated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "applicationId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "ProviderRejected",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "ProviderSuspended",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousAdminRole",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newAdminRole",
          "type": "bytes32"
        }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "VERIFIER_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "adminContributions",
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
      "name": "applications",
      "outputs": [
        {
          "internalType": "enum UnifiedTourismRegistry.ServiceType",
          "name": "serviceType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "panHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "applicationDataHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "documentsHash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "applicationDate",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "verifierNotes",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "verifiedBy",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "processed",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "razorpayPaymentId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "razorpayAmount",
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
          "name": "applicationId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "verifierNotes",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "verificationScore",
          "type": "uint8"
        }
      ],
      "name": "approveApplication",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "basicInfo",
      "outputs": [
        {
          "internalType": "string",
          "name": "fullName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "businessName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "phone",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "city",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "addressPlace",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "state",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "applicationIds",
          "type": "uint256[]"
        },
        {
          "internalType": "string",
          "name": "verifierNotes",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "verificationScore",
          "type": "uint8"
        }
      ],
      "name": "batchApproveApplications",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "certificationValidityPeriod",
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
      "name": "emergencyWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "estimateGasCosts",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "applicationCost",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "approvalCost",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "updateCost",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        }
      ],
      "name": "generateCertificate",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getContractBalance",
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
          "name": "providerId",
          "type": "uint256"
        }
      ],
      "name": "getLanguages",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPendingApplications",
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
          "internalType": "enum UnifiedTourismRegistry.ServiceType",
          "name": "serviceType",
          "type": "uint8"
        }
      ],
      "name": "getProvidersByServiceType",
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
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleAdmin",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        }
      ],
      "name": "getServiceDetails",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "facilities",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "serviceTypes",
          "type": "string[]"
        },
        {
          "internalType": "string",
          "name": "pricing",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "capacity",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getStatistics",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "totalApps",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalApps_approved",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalApps_rejected",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalProviders",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "contractBalance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalFunds",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
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
      "name": "languages",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextApplicationId",
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
      "name": "nextProviderId",
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
          "name": "",
          "type": "string"
        }
      ],
      "name": "panHashToProviderId",
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
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "professionalInfo",
      "outputs": [
        {
          "internalType": "string",
          "name": "experience",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "specialization",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "certifications",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "emergencyContact",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "operatingHours",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "establishedYear",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        }
      ],
      "name": "reactivateProvider",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "applicationId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "rejectApplication",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        }
      ],
      "name": "renewCertification",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "callerConfirmation",
          "type": "address"
        }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "requiredPaymentAmount",
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
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "serviceDetails",
      "outputs": [
        {
          "internalType": "string",
          "name": "pricing",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "capacity",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "licenseNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "insuranceInfo",
          "type": "string"
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
      "name": "serviceProviders",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        },
        {
          "internalType": "enum UnifiedTourismRegistry.ServiceType",
          "name": "serviceType",
          "type": "uint8"
        },
        {
          "internalType": "enum UnifiedTourismRegistry.Status",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "registrationDate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "expiryDate",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "panHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "documentsHash",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "uint8",
          "name": "verificationScore",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "razorpayPaymentId",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum UnifiedTourismRegistry.ServiceType",
          "name": "",
          "type": "uint8"
        }
      ],
      "name": "serviceTypeCount",
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
          "name": "periodInDays",
          "type": "uint256"
        }
      ],
      "name": "setCertificationValidityPeriod",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        },
        {
          "internalType": "string[]",
          "name": "_languages",
          "type": "string[]"
        }
      ],
      "name": "setLanguages",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountInPaisa",
          "type": "uint256"
        }
      ],
      "name": "setRequiredPaymentAmount",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "serviceTypeIndex",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "panHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "applicationDataHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "documentsHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "razorpayPaymentId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "razorpayAmount",
          "type": "uint256"
        }
      ],
      "name": "submitApplication",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "suspendProvider",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalApplications",
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
      "name": "totalApprovals",
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
      "name": "totalFunding",
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
      "name": "totalGasUsed",
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
      "name": "totalRejections",
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
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "fullName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "businessName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "phone",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "city",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "addr",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "state",
          "type": "string"
        }
      ],
      "name": "updateBasicInfo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "experience",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "specialization",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "certifications",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "emergencyContact",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "operatingHours",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "establishedYear",
          "type": "string"
        }
      ],
      "name": "updateProfessionalInfo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        },
        {
          "internalType": "string[]",
          "name": "facilities",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "serviceTypes",
          "type": "string[]"
        },
        {
          "internalType": "string",
          "name": "pricing",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "capacity",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "licenseNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "insuranceInfo",
          "type": "string"
        }
      ],
      "name": "updateServiceDetails",
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
      "name": "usedRazorpayPayments",
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
      "inputs": [
        {
          "internalType": "string",
          "name": "panHash",
          "type": "string"
        }
      ],
      "name": "verifyCertificateByPAN",
      "outputs": [
        {
          "internalType": "bool",
          "name": "isValid",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "providerId",
          "type": "uint256"
        },
        {
          "internalType": "enum UnifiedTourismRegistry.ServiceType",
          "name": "serviceType",
          "type": "uint8"
        },
        {
          "internalType": "enum UnifiedTourismRegistry.Status",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "expiryDate",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "fullName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "city",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export enum ServiceType {
  GUIDE = 0,
  ACCOMMODATION = 1,
  FOOD_RESTAURANT = 2,
  TRANSPORTATION = 3,
  ACTIVITY = 4
}

export const mapVendorTypeToServiceType = (vendorType: string): ServiceType => {
  switch (vendorType) {
    case 'GUIDE': return ServiceType.GUIDE;
    case 'ACCOMMODATION': return ServiceType.ACCOMMODATION;
    case 'FOOD_RESTAURANT': return ServiceType.FOOD_RESTAURANT;
    case 'TRANSPORT': return ServiceType.TRANSPORTATION;
    case 'ACTIVITY': return ServiceType.ACTIVITY;
    default: throw new Error(`Unknown vendor type: ${vendorType}`);
  }
};
export const mapServiceTypeToVendorType = (serviceType: Number): ServiceType => {
  
  switch (serviceType) {
    case 0:return ServiceType.GUIDE;
    case 1: return ServiceType.ACCOMMODATION;
    case 2: return ServiceType.FOOD_RESTAURANT;
    case 3: return ServiceType.TRANSPORTATION;
    case 4: return ServiceType.ACTIVITY;
    default: throw new Error(`Unknown vendor type: ${serviceType}`);
  }
};
export const hashPAN=(panNumber:string):string=>{
    const hash=crypto.createHash('sha512').update(panNumber).digest('hex');
    return hash;
}

export class TourismRegistryContract{
    private provider:ethers.JsonRpcProvider;
    private contract:ethers.Contract;
    private signer:ethers.Signer

    constructor(){
        this.provider=new ethers.JsonRpcProvider(
            process.env.NEXT_PUBLIC_RPC_URL || "https://amoy.polygonscan.com/"
        )
        const privateKey=process.env.ADMIN_PRIVATE_KEY;
        if(!privateKey) throw new Error("Admin private key not found");

        this.signer=new ethers.Wallet(privateKey,this.provider);
        this.contract=new ethers.Contract(CONTRACT_ADDRESS,TOURISM_REGISTRY_ABI,this.signer);
    }
    
    async submitApplication(
      serviceType: ServiceType,
      panHash: string,
      applicationDataHash: string,
      documentHash: string,
      razorpayPaymentId: string,
      razorpayAmount: number
  ): Promise<{success: boolean; applicationId?: number; error?: string}> {
      try {
          console.log("Data in the contract is ", serviceType, panHash, applicationDataHash, documentHash, razorpayAmount, razorpayPaymentId);
          
          const tx = await this.contract.submitApplication(
              serviceType,
              panHash,
              applicationDataHash,
              documentHash,
              razorpayPaymentId,
              razorpayAmount
          );
          
          const receipt = await tx.wait();
          console.log("Receipt in the contract is ", receipt);
  
          let applicationId: number | undefined;
  
          if (receipt?.logs && receipt.logs.length > 0) {
              for (const log of receipt.logs) {
                  try {
                      const parsedLog = this.contract.interface.parseLog({
                          topics: [...log.topics],
                          data: log.data
                      });
  
                      console.log("Parsed log:", parsedLog);
  
                      if (parsedLog && parsedLog.name === 'ApplicationSubmitted') {
                          applicationId = Number(parsedLog.args[0]);
                          console.log("Found ApplicationSubmitted event with ID:", applicationId);
                          break;
                      }
                  } catch (parseError:any) {
                      console.log("Skipping unparseable log:", parseError.message);
                      continue;
                  }
              }
          }
  
          if (!applicationId) {
              console.log("Could not parse event from logs, using alternative method...");
              
              const currentNextId = await this.contract.nextApplicationId();
              applicationId = Number(currentNextId) - 1;
              console.log("Using calculated applicationId:", applicationId);
          }
  
          if (applicationId && applicationId > 0) {
              return {
                  success: true,
                  applicationId
              };
          } else {
              throw new Error("Could not retrieve valid application ID");
          }
  
      } catch (error: any) {
          console.error("Contract submission error: ", error);
          return { 
              success: false, 
              error: error.message 
          };
      }
  }

  async approveApplication(applicationId:number,verifierNotes:string,verificationScore:number):
  Promise<{success:boolean,providerId?:number;error?:string}>{
      try{
          const tx=await this.contract.approveApplication(applicationId,verifierNotes,verificationScore)
          const receipt=await tx.wait();
          console.log("Receipt in the contract is ", receipt);

          let providerId: number | undefined;

          if (receipt?.logs && receipt.logs.length > 0) {
              for (const log of receipt.logs) {
                  try {
                      const parsedLog = this.contract.interface.parseLog({
                          topics: [...log.topics],
                          data: log.data
                      });

                      console.log("Parsed log:", parsedLog);

                      if (parsedLog && parsedLog.name === 'ProviderApproved') {
                          providerId = Number(parsedLog.args[0]);
                          console.log("Found ProviderApproved event with ID:", providerId);
                          break;
                      }
                  } catch (parseError: any) {
                      console.log("Skipping unparseable log:", parseError.message);
                      continue;
                  }
              }
          }

          if (providerId) {
              return {success:true,providerId};
          } else {
              console.log("Could not parse ProviderApproved event from logs");
              return {success:true}; 
          }
      }catch(error:any){
          console.error("Contract approval error: ",error);
          return {success:false,error:error.message}
      }
  }

    async rejectApplication(applicationId:number,reason:string):Promise<{success:boolean;error?:string}>{
      try{
        const tx=await this.contract.rejectApplication(applicationId,reason)
        const receipt = await tx.wait();
        console.log("Receipt in the contract is ", receipt);

        let rejectionConfirmed = false;

        if (receipt?.logs && receipt.logs.length > 0) {
            for (const log of receipt.logs) {
                try {
                    const parsedLog = this.contract.interface.parseLog({
                        topics: [...log.topics],
                        data: log.data
                    });

                    console.log("Parsed log:", parsedLog);

                    if (parsedLog && parsedLog.name === 'ApplicationRejected') {
                        rejectionConfirmed = true;
                        console.log("Found ApplicationRejected event for ID:", Number(parsedLog.args[0]));
                        break;
                    }
                } catch (parseError: any) {
                    console.log("Skipping unparseable log:", parseError.message);
                    continue;
                }
            }
        }

        return{success:true}
      }catch(error:any){
        console.error("Contract rejection error: ",error)
        return {success:false,error:error.message};
      }
    }

    async generateCertificate(providerId: number): Promise<{
      success: boolean;
      certificateHash?: string;
      transactionHash?: string;
      error?: string;
    }> {
      try {
        const tx = await this.contract.generateCertificate(providerId);
        const receipt = await tx.wait();
        console.log("Receipt in the contract is ", receipt);
    
        let certificateHash: string | undefined;
    
        if (receipt?.logs && receipt.logs.length > 0) {
          for (const log of receipt.logs) {
            try {
              const parsedLog = this.contract.interface.parseLog({
                topics: [...log.topics],
                data: log.data
              });
    
              console.log("Parsed log:", parsedLog);
    
              if (parsedLog && parsedLog.name === 'CertificateGenerated') {
                certificateHash = parsedLog.args[1];
                console.log("Found CertificateGenerated event with hash:", certificateHash);
                break;
              }
            } catch (parseError: any) {
              console.log("Skipping unparseable log:", parseError.message);
              continue;
            }
          }
        }
    
        console.log("Generate certificate hash is ", certificateHash);
        console.log("Transaction hash is ", receipt.hash);
    
        return { 
          success: true, 
          certificateHash,
          transactionHash: receipt.hash  
        };
      } catch (error: any) {
        console.error("Contract certificate generation error: ", error);
        return { success: false, error: error.message };
      }
    }

    async getStatistics(){
      try{
          const stats=await this.contract.getStatistics();
          console.log("Stats in the frontend is",stats);
          return{
              totalApplications:Number(stats[0]),
              totalApprovals:Number(stats[1]),
              totalRejections:Number(stats[2]),
              totalProviders:Number(stats[3]),
              contractBalance:ethers.formatEther(stats[4]),
              totalFunding:ethers.formatEther(stats[5])
          };
      }catch(error){
          console.error("Error getting statistics: ",error);
          return null;
      }
    }

    async getHeapStatistics(){
        try{
            const stats=await this.contract.getStatistics();
            return{
                totalApplications:Number(stats[0]),
                totalApprovals:Number(stats[1]),
                totalRejections:Number(stats[2]),
                totalProviders:Number(stats[3]),
                contractBalance:ethers.formatEther(stats[4]),
                totalFunding:ethers.formatEther(stats[5])
            };
        }catch(error){
            console.error("Error getting statistics: ",error);
            return null;
        }
    }

    async verifyCertificate(panHash:string){
        try{
            const result=await this.contract.verifyCertificateByPAN(panHash);
            return{
                isValid:result[0],
                providerId:Number(result[1]),
                serviceType:result[2],
                status:result[3],
                expiryDate:new Date(Number(result[4])*1000),
                fullName:result[5],
                city:result[6]
            };
        }catch(error){
            console.error('Error verifying certificate: ',error);
            return null;
        }
    }

    async getProviderDetails(providerId: number) {
      try {
          const provider = await this.contract.serviceProviders(providerId);
          const basicInfo = await this.contract.basicInfo(providerId);
          const professionalInfo = await this.contract.professionalInfo(providerId);
          
          return {
              provider,
              basicInfo,
              professionalInfo
          };
      } catch (error) {
          console.error('Error getting provider details: ', error);
          return null;
      }
    }

    async getPendingApplications(): Promise<number[]> {
        try {
            const applicationIds = await this.contract.getPendingApplications();
            console.log("Application ids in the frontend is ",applicationIds)
            return applicationIds.map((id: any) => Number(id));
        } catch (error) {
            console.error('Error getting pending applications: ', error);
            return [];
        }
    }

    async getApplication(applicationId: number) {
        try {
            return await this.contract.applications(applicationId);
        } catch (error) {
            console.error('Error getting application: ', error);
            return null;
        }
    }
}
