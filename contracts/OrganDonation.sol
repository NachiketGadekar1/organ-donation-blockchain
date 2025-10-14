// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OrganDonation {
    struct Donor {
        string name;
        string organ;
        bool isAvailable;
    }

    mapping(address => Donor) public donors;

    event DonorRegistered(address donor, string name, string organ);
    event OrganDonated(address donor, string organ);

    function registerDonor(string memory _name, string memory _organ) public {
        donors[msg.sender] = Donor(_name, _organ, true);
        emit DonorRegistered(msg.sender, _name, _organ);
    }

    function donateOrgan() public {
        require(donors[msg.sender].isAvailable, "Not registered or already donated");
        donors[msg.sender].isAvailable = false;
        emit OrganDonated(msg.sender, donors[msg.sender].organ);
    }

    function getDonor(address _donor) public view returns (string memory, string memory, bool) {
        Donor memory d = donors[_donor];
        return (d.name, d.organ, d.isAvailable);
    }
}

