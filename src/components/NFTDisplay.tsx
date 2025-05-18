import { useContractRead } from 'wagmi';
import { BLACKJACK_NFT_ADDRESS, BLACKJACK_NFT_ABI } from '../config/contracts';

interface NFTDisplayProps {
  tokenId: number;
}

export function NFTDisplay({ tokenId }: NFTDisplayProps) {
  const { data: tokenURI, isError, isLoading } = useContractRead({
    address: BLACKJACK_NFT_ADDRESS,
    abi: BLACKJACK_NFT_ABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  });

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-lg">
        <h3 className="text-lg font-bold mb-2 text-red-500">Failed to load NFT</h3>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-lg">
      <h3 className="text-lg font-bold mb-2">Blackjack NFT #{tokenId}</h3>
      {tokenURI && (
        <img 
          src={tokenURI.toString()} 
          alt={`NFT #${tokenId}`}
          className="w-48 h-48 object-cover rounded"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-nft.png'; // 添加一个默认图片
          }}
        />
      )}
    </div>
  );
} 