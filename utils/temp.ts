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