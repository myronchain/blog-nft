// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";


contract BlogAsset is
ERC721,
ERC721Burnable,
ERC721Pausable,
ReentrancyGuard,
AccessControlEnumerable
{
    struct MintParams {
        address receiver;
        uint32 tokenId;
        uint32 amount;
    }

    event TokenMinted(uint256 indexed tokenId, uint32 indexed numMinted);


    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MAINTAINER_ROLE = keccak256("MAINTAINER_ROLE");

    constructor(
        string memory initName,
        string memory initSymbol,
        string memory initBaseURI
    ) ERC721(initName, initSymbol) {
        __baseURI = initBaseURI;
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MAINTAINER_ROLE, _msgSender());
    }

    modifier onlyMaintainer() {
        require(hasRole(MAINTAINER_ROLE, _msgSender()), "not maintainer");
        _;
    }

    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, _msgSender()), "not minter");
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "not admin");
        _;
    }

    // key: token_id value: ipfs hash
    mapping(uint256 => string) private _tokenURIs;
    string private __baseURI;

    function _setTokenURI(uint32 tokenId, string calldata uri) internal {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        _tokenURIs[tokenId] = uri;
    }

    function setTokenURI(uint32 tokenId, string calldata uri) public onlyMaintainer {
        _tokenURIs[tokenId] = uri;
    }

    function mint(
        address to,
        uint32 tokenId,
        string calldata ipfsHash
    ) public returns (uint256) {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsHash);
        emit TokenMinted(tokenId, tokenId);
        return tokenId;
    }

    // override views
    function _baseURI() internal view override returns (string memory) {
        return __baseURI;
    }

    // views
    function baseURI() external view returns (string memory) {
        return _baseURI();
    }

    function setBaseURI(string memory newBaseURI) external onlyMaintainer {
        __baseURI = newBaseURI;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory base = _baseURI();
        return bytes(base).length > 0 ? string(abi.encodePacked(base, _tokenURIs[tokenId])) : "";
    }

    // override internals
    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, AccessControlEnumerable)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function pause() external onlyMaintainer {
        _pause();
    }

    function unpause() external onlyMaintainer {
        _unpause();
    }

    // public functions
    // batch transfer all the tokens to a same address
    function safeTransferFromBatch(
        address from,
        address to,
        uint256[] calldata tokenIds
    ) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            safeTransferFrom(from, to, tokenIds[i]);
        }
    }

    // batch transfer tokens to different addresses
    function safeTransferFromToAddresses(
        address from,
        address[] calldata receivers,
        uint256[] calldata tokenIds
    ) external {
        for (uint256 i = 0; i < receivers.length; i++) {
            safeTransferFrom(from, receivers[i], tokenIds[i]);
        }
    }
}
