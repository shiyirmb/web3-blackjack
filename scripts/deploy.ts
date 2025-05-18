import { ethers } from "hardhat";

async function main() {
  // filebase上的json地址，确保以 / 结尾
  const baseTokenURI = "https://stuck-blush-sheep.myfilebase.com/ipfs/QmNgEPicSo9F5zrEFD1wZZTKGHLMBZmGtRHPCGvpKALY7g/";
  const BlackjackNFT = await ethers.getContractFactory("BlackjackNFT");
  const nft = await BlackjackNFT.deploy(baseTokenURI);

  // 等待合约部署完成
  await nft.deployed();
  console.log("BlackjackNFT deployed to:", nft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});