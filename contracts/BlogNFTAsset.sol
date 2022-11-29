// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract BlogNFTAsset is
    Initializable,
    ERC721Upgradeable,
    ERC721BurnableUpgradeable,
    ERC721PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    AccessControlEnumerableUpgradeable,
    UUPSUpgradeable
{
    struct MintParams {
        address receiver;
        uint32 tokenId;
        uint32 amount;
    }

    bytes32 public MINTER_ROLE;
    bytes32 public MAINTAINER_ROLE;
    // key: token_id value: ipfs hash
    mapping(uint256 => string) private _tokenURIs;
    string private __baseURI;

    event TokenMinted(uint256 indexed tokenId, uint32 indexed numMinted);

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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        string memory initName,
        string memory initSymbol,
        string memory initBaseURI
    ) external initializer {
        __ReentrancyGuard_init();
        __AccessControlEnumerable_init();
        __UUPSUpgradeable_init();
        __ERC721_init(initName, initSymbol);
        __ERC721Burnable_init();
        __ERC721Pausable_init();

        MINTER_ROLE = keccak256("MINTER_ROLE");
        MAINTAINER_ROLE = keccak256("MAINTAINER_ROLE");

        __baseURI = initBaseURI;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MAINTAINER_ROLE, _msgSender());
    }

    function _setTokenURI(uint32 tokenId, string calldata uri) internal {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        _tokenURIs[tokenId] = uri;
    }

    function setTokenURI(
        uint32 tokenId,
        string calldata uri
    ) public onlyMaintainer {
        _tokenURIs[tokenId] = uri;
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}

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
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        string memory base = _baseURI();
        return
            bytes(base).length > 0
                ? string(abi.encodePacked(base, _tokenURIs[tokenId]))
                : "";
    }

    // override internals
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721Upgradeable, AccessControlEnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721PausableUpgradeable) {
        super._beforeTokenTransfer(from, to, firstTokenId, tokenId);
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

    function pause() external onlyMaintainer {
        _pause();
    }

    function unpause() external onlyMaintainer {
        _unpause();
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;

}
