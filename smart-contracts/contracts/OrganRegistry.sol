// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title OrganRegistry - Transparent organ donation & transplant registry
/// @notice Stores non-PII with PII kept off-chain; uses content hashes to link records
contract OrganRegistry is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant OPO_ROLE = keccak256("OPO_ROLE"); // Organ Procurement Organization
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // --- Enums ---
    enum OrganType { Kidney, Liver, Heart, Lung, Pancreas, Intestine, Cornea, Other }
    enum OrganStatus { Listed, Reserved, Transplanted, Revoked }

    // --- Structs ---
    struct Donor {
        address createdBy;
        bytes32 offchainHash; // hash(pointer to encrypted donor file in IPFS/S3)
        bool active;
    }

    struct Recipient {
        address createdBy;
        bytes32 offchainHash; // hash(pointer to encrypted recipient file)
        bool active;
    }

    struct Organ {
        uint256 organId;
        OrganType organType;
        bytes32 donorRef; // keccak of donor offchain doc id
        bytes32 bloodHlaHash; // hash of blood type + HLA summary
        OrganStatus status;
        address listedBy;
        address reservedFor; // recipient address that reserved it (virtual id)
        uint256 reservedAt;
        uint256 transplantedAt;
    }

    // --- Storage ---
    mapping(bytes32 => Donor) public donors;        // key: donorIdHash
    mapping(bytes32 => Recipient) public recipients;// key: recipientIdHash
    mapping(uint256 => Organ) public organs;        // key: organId
    uint256 public organSeq;

    // --- Events ---
    event DonorRegistered(bytes32 indexed donorIdHash, address indexed by, bytes32 offchainHash);
    event DonorUpdated(bytes32 indexed donorIdHash, bytes32 offchainHash, bool active);
    event RecipientRegistered(bytes32 indexed recipientIdHash, address indexed by, bytes32 offchainHash);
    event RecipientUpdated(bytes32 indexed recipientIdHash, bytes32 offchainHash, bool active);
    event OrganListed(uint256 indexed organId, OrganType organType, bytes32 indexed donorIdHash, bytes32 bloodHlaHash, address listedBy);
    event OrganReserved(uint256 indexed organId, bytes32 indexed recipientIdHash, address by);
    event OrganTransplanted(uint256 indexed organId, bytes32 indexed recipientIdHash, uint256 when, address by);
    event OrganRevoked(uint256 indexed organId, address by, string reason);
  

    // --- Constructor ---
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AUDITOR_ROLE, admin);
    }

    // --- Modifiers ---
    modifier onlyHospital() {
        require(hasRole(HOSPITAL_ROLE, msg.sender), "Not hospital");
        _;
    }

    modifier onlyOPO() {
        require(hasRole(OPO_ROLE, msg.sender), "Not OPO");
        _;
    }

    // --- Pause Controls ---
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
        emit Paused(msg.sender);
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
        emit Unpaused(msg.sender);
    }

    // --- Donors ---
    function registerDonor(bytes32 donorIdHash, bytes32 offchainHash) external onlyOPO whenNotPaused {
        require(donors[donorIdHash].createdBy == address(0), "Donor exists");
        donors[donorIdHash] = Donor(msg.sender, offchainHash, true);
        emit DonorRegistered(donorIdHash, msg.sender, offchainHash);
    }

    function updateDonor(bytes32 donorIdHash, bytes32 offchainHash, bool active) external onlyOPO whenNotPaused {
        require(donors[donorIdHash].createdBy != address(0), "Donor !found");
        donors[donorIdHash].offchainHash = offchainHash;
        donors[donorIdHash].active = active;
        emit DonorUpdated(donorIdHash, offchainHash, active);
    }

    // --- Recipients ---
    function registerRecipient(bytes32 recipientIdHash, bytes32 offchainHash) external onlyHospital whenNotPaused {
        require(recipients[recipientIdHash].createdBy == address(0), "Recipient exists");
        recipients[recipientIdHash] = Recipient(msg.sender, offchainHash, true);
        emit RecipientRegistered(recipientIdHash, msg.sender, offchainHash);
    }

    function updateRecipient(bytes32 recipientIdHash, bytes32 offchainHash, bool active) external onlyHospital whenNotPaused {
        require(recipients[recipientIdHash].createdBy != address(0), "Recipient !found");
        recipients[recipientIdHash].offchainHash = offchainHash;
        recipients[recipientIdHash].active = active;
        emit RecipientUpdated(recipientIdHash, offchainHash, active);
    }

    // --- Organs lifecycle ---
    function listOrgan(OrganType organType, bytes32 donorIdHash, bytes32 bloodHlaHash) external onlyOPO whenNotPaused returns (uint256) {
        require(donors[donorIdHash].active, "Donor inactive/!found");
        organSeq += 1;
        uint256 id = organSeq;
        organs[id] = Organ({
            organId: id,
            organType: organType,
            donorRef: donorIdHash,
            bloodHlaHash: bloodHlaHash,
            status: OrganStatus.Listed,
            listedBy: msg.sender,
            reservedFor: address(0),
            reservedAt: 0,
            transplantedAt: 0
        });
        emit OrganListed(id, organType, donorIdHash, bloodHlaHash, msg.sender);
        return id;
    }

    function reserveOrgan(uint256 organId, bytes32 recipientIdHash) external onlyHospital whenNotPaused {
        Organ storage o = organs[organId];
        require(o.status == OrganStatus.Listed, "Not listable");
        require(recipients[recipientIdHash].active, "Recipient inactive/!found");
        o.status = OrganStatus.Reserved;
        o.reservedFor = msg.sender; // hospital that reserved
        o.reservedAt = block.timestamp;
        emit OrganReserved(organId, recipientIdHash, msg.sender);
    }

    function recordTransplant(uint256 organId, bytes32 recipientIdHash) external onlyHospital nonReentrant whenNotPaused {
        Organ storage o = organs[organId];
        require(o.status == OrganStatus.Reserved, "Not reserved");
        require(o.reservedFor == msg.sender, "Reserved by other hospital");
        o.status = OrganStatus.Transplanted;
        o.transplantedAt = block.timestamp;
        emit OrganTransplanted(organId, recipientIdHash, block.timestamp, msg.sender);
    }

    function revokeOrgan(uint256 organId, string calldata reason) external whenNotPaused {
        Organ storage o = organs[organId];
        require(hasRole(OPO_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "No revoke rights");
        require(o.status == OrganStatus.Listed || o.status == OrganStatus.Reserved, "Cannot revoke");
        o.status = OrganStatus.Revoked;
        emit OrganRevoked(organId, msg.sender, reason);
    }
}
