// Smart Contract ABI and Configuration
// The Contract Address can also be stored here directly for cleanliness

// Use environment variable if available, otherwise use fallback address
export const CONTRACT_ADDRESS = process.env.BLOCKCHAIN_CONTRACT_ADDRESS || "0x089A82AEF9142143D497D24A07063D6B31A095A4";

export const CONTRACT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "issueId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "actionId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "officer",
				"type": "string"
			}
		],
		"name": "ActionAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "issueId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "expenseId",
				"type": "uint256"
			}
		],
		"name": "ExpenseAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "issueId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "officer",
				"type": "string"
			}
		],
		"name": "IssueAcknowledged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "issueId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "summary",
				"type": "string"
			}
		],
		"name": "IssueCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "issueId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "citizen",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "title",
				"type": "string"
			}
		],
		"name": "IssueCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_issueId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_officer",
				"type": "string"
			}
		],
		"name": "acknowledgeIssue",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "actionCounter",
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
		"name": "actionPoints",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "actionId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "issueId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "officer",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
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
				"name": "_issueId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_officer",
				"type": "string"
			},
			{
				"internalType": "string[]",
				"name": "_photoUrls",
				"type": "string[]"
			}
		],
		"name": "addActionPoint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "citizenIssues",
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
				"name": "_issueId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_summary",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_beforePhotoUrl",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_afterPhotoUrl",
				"type": "string"
			}
		],
		"name": "completeIssue",
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
		"name": "completions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "issueId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "summary",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "beforePhotoUrl",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "afterPhotoUrl",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "completedAt",
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
				"name": "_citizen",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_location",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_nagarpalika",
				"type": "string"
			}
		],
		"name": "createIssue",
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
		"name": "expenseCounter",
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
		"name": "expenses",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "expenseId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "issueId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "vendor",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
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
				"name": "_issueId",
				"type": "uint256"
			}
		],
		"name": "getActionPoints",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "actionId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "issueId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "officer",
						"type": "string"
					},
					{
						"internalType": "string[]",
						"name": "cloudinaryPhotoUrls",
						"type": "string[]"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct CivicIssueTracking.ActionPoint[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_citizen",
				"type": "address"
			}
		],
		"name": "getCitizenIssues",
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
				"name": "_issueId",
				"type": "uint256"
			}
		],
		"name": "getCompletion",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "issueId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "summary",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "beforePhotoUrl",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "afterPhotoUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "completedAt",
						"type": "uint256"
					}
				],
				"internalType": "struct CivicIssueTracking.Completion",
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
				"name": "_issueId",
				"type": "uint256"
			}
		],
		"name": "getExpenses",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "expenseId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "issueId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "vendor",
						"type": "string"
					},
					{
						"internalType": "string[]",
						"name": "proofDocuments",
						"type": "string[]"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct CivicIssueTracking.Expense[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_issueId",
				"type": "uint256"
			}
		],
		"name": "getIssue",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "issueId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "citizenAddress",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "location",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "nagarpalikaName",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "createdAt",
						"type": "uint256"
					},
					{
						"internalType": "enum CivicIssueTracking.IssueStatus",
						"name": "status",
						"type": "uint8"
					}
				],
				"internalType": "struct CivicIssueTracking.Issue",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "issueCounter",
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
		"name": "issues",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "issueId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "citizenAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "location",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "nagarpalikaName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "createdAt",
				"type": "uint256"
			},
			{
				"internalType": "enum CivicIssueTracking.IssueStatus",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_issueId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_vendor",
				"type": "string"
			},
			{
				"internalType": "string[]",
				"name": "_proofDocs",
				"type": "string[]"
			}
		],
		"name": "recordExpense",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
