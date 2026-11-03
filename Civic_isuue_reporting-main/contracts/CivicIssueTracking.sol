// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CivicIssueTracking {
    
    // Issue statuses
    enum IssueStatus { SUBMITTED, ACKNOWLEDGED, IN_PROGRESS, COMPLETED }
    
    // Counters
    uint256 public issueCounter = 0;
    uint256 public actionCounter = 0;
    uint256 public expenseCounter = 0;

    // Issue structure
    struct Issue {
        uint256 issueId;
        address citizenAddress;
        string title;
        string description;
        string location;
        string nagarpalikaName;
        uint256 createdAt;
        IssueStatus status;
        bool exists;
    }

    // Action Point structure
    struct ActionPoint {
        uint256 actionId;
        uint256 issueId;
        string description;
        string officer;
        string[] cloudinaryPhotoUrls;
        uint256 timestamp;
    }

    // Expense structure
    struct Expense {
        uint256 expenseId;
        uint256 issueId;
        string description;
        uint256 amount;
        string vendor;
        string[] proofDocuments;
        uint256 timestamp;
    }

    // Completion structure
    struct Completion {
        uint256 issueId;
        string summary;
        string beforePhotoUrl;
        string afterPhotoUrl;
        uint256 completedAt;
        bool exists;
    }

    // Mappings
    mapping(uint256 => Issue) public issues;
    mapping(uint256 => ActionPoint[]) public actionPoints;
    mapping(uint256 => Expense[]) public expenses;
    mapping(uint256 => Completion) public completions;
    mapping(address => uint256[]) public citizenIssues;

    // Events
    event IssueCreated(uint256 indexed issueId, address citizen, string title);
    event IssueAcknowledged(uint256 indexed issueId, string officer);
    event ActionAdded(uint256 indexed issueId, uint256 actionId, string officer);
    event ExpenseAdded(uint256 indexed issueId, uint256 expenseId);
    event IssueCompleted(uint256 indexed issueId, string summary);

    // Create new issue (called by Nagarpalika when they first interact with an issue)
    function createIssue(
        address _citizen,
        string memory _title,
        string memory _description,
        string memory _location,
        string memory _nagarpalika
    ) public returns (uint256) {
        issueCounter++;
        uint256 newIssueId = issueCounter;

        issues[newIssueId] = Issue({
            issueId: newIssueId,
            citizenAddress: _citizen,
            title: _title,
            description: _description,
            location: _location,
            nagarpalikaName: _nagarpalika,
            createdAt: block.timestamp,
            status: IssueStatus.SUBMITTED,
            exists: true
        });

        citizenIssues[_citizen].push(newIssueId);

        emit IssueCreated(newIssueId, _citizen, _title);
        return newIssueId;
    }

    // Acknowledge issue - also auto-creates if not on chain yet
    function acknowledgeIssue(uint256 _issueId, string memory _officer) public {
        // If issue doesn't exist on-chain, create a placeholder
        if (!issues[_issueId].exists) {
            issues[_issueId] = Issue({
                issueId: _issueId,
                citizenAddress: msg.sender,
                title: "Issue from database",
                description: "",
                location: "",
                nagarpalikaName: "",
                createdAt: block.timestamp,
                status: IssueStatus.SUBMITTED,
                exists: true
            });
        }

        issues[_issueId].status = IssueStatus.ACKNOWLEDGED;
        emit IssueAcknowledged(_issueId, _officer);
    }

    // Add action point - photos are optional now
    function addActionPoint(
        uint256 _issueId,
        string memory _description,
        string memory _officer,
        string[] memory _photoUrls
    ) public {
        // Auto-create issue if not on chain
        if (!issues[_issueId].exists) {
            issues[_issueId] = Issue({
                issueId: _issueId,
                citizenAddress: msg.sender,
                title: "Issue from database",
                description: "",
                location: "",
                nagarpalikaName: "",
                createdAt: block.timestamp,
                status: IssueStatus.IN_PROGRESS,
                exists: true
            });
        }

        actionCounter++;
        
        actionPoints[_issueId].push(ActionPoint({
            actionId: actionCounter,
            issueId: _issueId,
            description: _description,
            officer: _officer,
            cloudinaryPhotoUrls: _photoUrls,
            timestamp: block.timestamp
        }));

        if (issues[_issueId].status == IssueStatus.ACKNOWLEDGED) {
            issues[_issueId].status = IssueStatus.IN_PROGRESS;
        }

        emit ActionAdded(_issueId, actionCounter, _officer);
    }

    // Record expense
    function recordExpense(
        uint256 _issueId,
        string memory _description,
        uint256 _amount,
        string memory _vendor,
        string[] memory _proofDocs
    ) public {
        // Auto-create issue if not on chain
        if (!issues[_issueId].exists) {
            issues[_issueId] = Issue({
                issueId: _issueId,
                citizenAddress: msg.sender,
                title: "Issue from database",
                description: "",
                location: "",
                nagarpalikaName: "",
                createdAt: block.timestamp,
                status: IssueStatus.IN_PROGRESS,
                exists: true
            });
        }

        expenseCounter++;

        expenses[_issueId].push(Expense({
            expenseId: expenseCounter,
            issueId: _issueId,
            description: _description,
            amount: _amount,
            vendor: _vendor,
            proofDocuments: _proofDocs,
            timestamp: block.timestamp
        }));

        emit ExpenseAdded(_issueId, expenseCounter);
    }

    // Complete issue
    function completeIssue(
        uint256 _issueId,
        string memory _summary,
        string memory _beforePhotoUrl,
        string memory _afterPhotoUrl
    ) public {
        // Auto-create issue if not on chain
        if (!issues[_issueId].exists) {
            issues[_issueId] = Issue({
                issueId: _issueId,
                citizenAddress: msg.sender,
                title: "Issue from database",
                description: "",
                location: "",
                nagarpalikaName: "",
                createdAt: block.timestamp,
                status: IssueStatus.IN_PROGRESS,
                exists: true
            });
        }

        issues[_issueId].status = IssueStatus.COMPLETED;

        completions[_issueId] = Completion({
            issueId: _issueId,
            summary: _summary,
            beforePhotoUrl: _beforePhotoUrl,
            afterPhotoUrl: _afterPhotoUrl,
            completedAt: block.timestamp,
            exists: true
        });

        emit IssueCompleted(_issueId, _summary);
    }

    // ====== READ FUNCTIONS ======

    // Get issue details
    function getIssue(uint256 _issueId) public view returns (Issue memory) {
        return issues[_issueId];
    }

    // Get all action points for issue
    function getActionPoints(uint256 _issueId) public view returns (ActionPoint[] memory) {
        return actionPoints[_issueId];
    }

    // Get all expenses for issue
    function getExpenses(uint256 _issueId) public view returns (Expense[] memory) {
        return expenses[_issueId];
    }

    // Get citizen's issues
    function getCitizenIssues(address _citizen) public view returns (uint256[] memory) {
        return citizenIssues[_citizen];
    }

    // Get completion details
    function getCompletion(uint256 _issueId) public view returns (Completion memory) {
        return completions[_issueId];
    }
}
