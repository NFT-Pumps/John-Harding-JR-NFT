// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/********************
 * @author: Techoshi.eth *
        <(^_^)>
 ********************/

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "./DateTimeLib.sol";

contract JHJEvents is
    Ownable,
    ERC721,
    ERC721URIStorage,
    ReentrancyGuard,
    PaymentSplitter
{
    using Counters for Counters.Counter;
    using ECDSA for bytes32;
    using Strings for uint256;

    Counters.Counter private _eventSupply;
    Counters.Counter private _tokenSupply;

    //uint256 public constant MAX_TOKENS = 25;
    uint256 public publicMintMaxLimit = 5;
    uint256 public tokenPriceGA = 0.055 ether;
    uint256 public tokenPriceRS = 0.075 ether;

    bool public publicMintIsOpen = false;

    string _baseTokenURI;
    string public baseExtension = ".json";
    string public hiddenMetadataUri;

    address private _ContractVault = 0x0000000000000000000000000000000000000000;

    mapping(address => bool) whitelistedAddresses;

    string public Author = "techoshi.eth";
    string public ProjectTeam = "NFT Pumps";

    struct eventSchedule {
        string title;
        uint256 eventID;
        uint256 startMint;
        uint256 endMint;
        uint16 noOfGeneralMints;
        uint16 noOfRingSideMints;
        uint16 generalMinted;
        uint16 ringsideMinted;
        bool state;
        bool revealed;
        string generalHiddenMetadataUri;
        string ringsideHiddenMetadataUri;
    }

    enum seatType {
        General,
        Ringside
    }

    eventSchedule[] private allEvents;
    mapping(uint256 => bool) public eventsMap;
    mapping(uint256 => uint256) public tokenToEventMap;
    mapping(uint256 => seatType) public tokenToSeatTypeMap;

    constructor(
        string memory contractName,
        string memory contractSymbol,
        address _vault,
        string memory __baseTokenURI,
        address[] memory _payees,
        uint256[] memory _shares
    )
        payable
        ERC721(contractName, contractSymbol)
        PaymentSplitter(_payees, _shares)
    {
        _ContractVault = _vault;
        _baseTokenURI = __baseTokenURI;
    }

    function wfs() external onlyOwner nonReentrant {
        payable(_ContractVault).transfer(address(this).balance);
    }

    event eventCreated(uint256);

    function createAdmissionEvent(
        string memory title,
        uint256 openMintDate,
        uint256 closedMintDate,
        uint16 generalMints,
        uint16 ringsideMints,
        string memory generalHiddenMetadataUri,
        string memory ringsideHiddenMetadataUri,
        bool forceState,
        bool _revealed
    ) external {
        eventSchedule memory thisRecord = eventSchedule({
            eventID: _eventSupply.current(),
            title: title,
            startMint: openMintDate,
            endMint: closedMintDate,
            noOfGeneralMints: generalMints,
            noOfRingSideMints: ringsideMints,
            state: forceState,
            generalMinted: 0,
            ringsideMinted: 0,
            generalHiddenMetadataUri: generalHiddenMetadataUri,
            ringsideHiddenMetadataUri: ringsideHiddenMetadataUri,
            revealed: _revealed
        });

        allEvents.push(thisRecord);
        eventsMap[thisRecord.eventID] = true;
        _eventSupply.increment();

        emit eventCreated(thisRecord.eventID);
    }

    function updateAdmissionEvent(
        uint256 eventID,
        string memory title,
        uint256 openMintDate,
        uint256 closedMintDate,
        uint16 generalMints,
        uint16 ringsideMints,
        string memory generalHiddenMetadataUri,
        string memory ringsideHiddenMetadataUri,
        bool forceState,
        bool _revealed
    ) external {
        require(allEvents.length >= eventID, "Invalid Event ID");
        require(eventsMap[eventID] == true, "Event Doesnt Exist");

        eventSchedule memory recordToBeUpdated = allEvents[eventID];

        recordToBeUpdated.title = title;
        recordToBeUpdated.startMint = openMintDate;
        recordToBeUpdated.endMint = closedMintDate;
        recordToBeUpdated.state = forceState;
        recordToBeUpdated.revealed = _revealed;
        recordToBeUpdated.noOfGeneralMints = generalMints;
        recordToBeUpdated.noOfRingSideMints = ringsideMints;
        recordToBeUpdated.generalHiddenMetadataUri = generalHiddenMetadataUri;
        recordToBeUpdated.ringsideHiddenMetadataUri = ringsideHiddenMetadataUri;

        allEvents[eventID] = recordToBeUpdated;
    }

    modifier isValidEventMint(
        uint256 eventID,
        uint256 quantity,
        seatType mintType
    ) {
        require(eventsMap[eventID] == true, "Event Doesnt Exist");
        require(
            allEvents[eventID].startMint <= currentTimestamp() &&
                allEvents[eventID].endMint >= currentTimestamp() &&
                allEvents[eventID].state == true,
            "Can't mint for this event"
        );

        require(publicMintIsOpen == true, "Mint is Closed");
        require(quantity <= publicMintMaxLimit, "Mint amount too large");

        uint16 maxNoOfMints = 0;
        uint16 currentSupplyOfMintType = 0;

        if (mintType == seatType.General) {
            maxNoOfMints = allEvents[eventID].noOfGeneralMints;
            currentSupplyOfMintType = allEvents[eventID].generalMinted;
        }

        if (mintType == seatType.Ringside) {
            maxNoOfMints = allEvents[eventID].noOfRingSideMints;
            currentSupplyOfMintType = allEvents[eventID].ringsideMinted;
        }

        require(
            quantity + currentSupplyOfMintType <= maxNoOfMints,
            "Not enough tokens remaining"
        );

        _;
    }

    function currentTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    function getEvents() public view returns (eventSchedule[] memory) {
        return allEvents;
    }

    function getEvent(uint256 eventID)
        public
        view
        returns (eventSchedule memory)
    {
        require(eventID >= 0, "Invalid Event ID");
        require(eventsMap[eventID] == true, "Event Doesnt Exist");

        return allEvents[eventID];
    }

    function generalAdmissionMint(uint256 eventID, uint16 quantity)
        external
        payable
        isValidEventMint(eventID, quantity, seatType.General)
    {
        require(tokenPriceGA * quantity <= msg.value, "Not enough ether sent");
        uint256 supply = _tokenSupply.current();

        allEvents[eventID].generalMinted += quantity;

        for (uint256 i = 0; i < quantity; i++) {
            _tokenSupply.increment();
            tokenToEventMap[supply + i] = eventID;
            tokenToSeatTypeMap[supply + i] = seatType.General;
            _safeMint(msg.sender, supply + i);
        }
    }

    function ringSideMint(uint256 eventID, uint16 quantity)
        external
        payable
        isValidEventMint(eventID, quantity, seatType.Ringside)
    {
        require(tokenPriceRS * quantity <= msg.value, "Not enough ether sent");
        uint256 supply = _tokenSupply.current();

        allEvents[eventID].ringsideMinted += quantity;

        for (uint256 i = 0; i < quantity; i++) {
            _tokenSupply.increment();
            tokenToEventMap[supply + i] = eventID;
            tokenToSeatTypeMap[supply + i] = seatType.Ringside;
            _safeMint(msg.sender, supply + i);
        }
    }

    function setParams(
        uint256 newGeneralPrice,
        uint256 newRingsidePrice,
        uint256 setOpenMintLimit,
        bool setPublicMintState
    ) external onlyOwner {
        tokenPriceRS = newRingsidePrice;
        tokenPriceGA = newGeneralPrice;
        publicMintMaxLimit = setOpenMintLimit;
        publicMintIsOpen = setPublicMintState;
    }

    function setTransactionMintLimit(uint256 newMintLimit) external onlyOwner {
        publicMintMaxLimit = newMintLimit;
    }

    function setGeneralPrice(uint256 newPrice) external onlyOwner {
        tokenPriceGA = newPrice;
    }

    function setRingsidePrice(uint256 newPrice) external onlyOwner {
        tokenPriceRS = newPrice;
    }

    function togglePublicMint() external onlyOwner {
        publicMintIsOpen = !publicMintIsOpen;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenSupply.current();
    }

     function totalEvents() public view returns (uint256) {
        return _eventSupply.current();
    }

    function getTokenEventID(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token ID doesn't exist");

        return tokenToEventMap[tokenId];
    }

    function getTokenSeatType(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token ID doesn't exist");
        if (tokenToSeatTypeMap[tokenId] == seatType.Ringside) {
            return 1;
        } else {
            return 0;
        }
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    function setVaultAddress(address newVault) external onlyOwner {
        _ContractVault = newVault;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    //receive() external payable {}

    function setBaseExtension(string memory _baseExtension) public onlyOwner {
        baseExtension = _baseExtension;
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function burn(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        if (allEvents[tokenToEventMap[_tokenId]].revealed == false) {
            if (tokenToSeatTypeMap[_tokenId] == seatType.Ringside) {
                return
                    allEvents[tokenToEventMap[_tokenId]]
                        .ringsideHiddenMetadataUri;
            } else {
                return
                    allEvents[tokenToEventMap[_tokenId]]
                        .generalHiddenMetadataUri;
            }
        }

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenToEventMap[_tokenId].toString(),
                        "/",
                        _tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    function getTokenEvent(uint256 _tokenId) public view returns (uint256) {
        require(_exists(_tokenId), "Nonexistent token");

        uint256 _eventID = tokenToEventMap[_tokenId];
        require(_eventID >= 0, "Event Doesnt Exist");

        return allEvents[_eventID].eventID;
    }

    function setRevealed(uint256 eventID, bool _state) public onlyOwner {
        allEvents[eventID].revealed = _state;
    }
}
