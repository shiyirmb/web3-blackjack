// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BlackjackNFT is ERC721 {
    // tokenId自增
    uint256 public currentTokenId = 0;

    // baseURI 存储NFT元数据的基础地址
    string public baseTokenURI;

    constructor(string memory _baseTokenURI) ERC721("BlackjackNFT", "BJN") {
        baseTokenURI = _baseTokenURI;
    }

    // 所有人都可以铸造NFT
    function mint(address to) external returns (uint256) {
        currentTokenId += 1;
        _safeMint(to, currentTokenId);
        return currentTokenId;
    }

    // 重写tokenURI，返回filebase上的json地址
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // 使用 ownerOf 来检查 token 是否存在，如果不存在会抛出错误
        ownerOf(tokenId);
        // 确保 baseTokenURI 以 / 结尾
        string memory baseURI = baseTokenURI;
        if (bytes(baseURI).length > 0 && bytes(baseURI)[bytes(baseURI).length - 1] != "/") {
            baseURI = string(abi.encodePacked(baseURI, "/"));
        }
        return string(abi.encodePacked(baseURI, _toString(tokenId)));
    }

    // 将 uint256 转换为 string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}