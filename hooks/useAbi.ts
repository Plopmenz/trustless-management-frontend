import { isAddress } from "@/utils/evm"
import { getImplementation, isProxyContract } from "@/utils/proxies"
import { whatsabi } from "@shazow/whatsabi"
import { useQuery } from "@tanstack/react-query"
import { AbiFunction } from "abitype"
import { Address, PublicClient, zeroAddress } from "viem"

import { useToast } from "@/components/ui/use-toast"

export const useAbi = (
  contractAddress: Address,
  publicClient: PublicClient
) => {
  const { toast } = useToast()
  const chainId = publicClient.chain?.id || 0

  const { data: implementationAddress, isLoading: isLoadingImpl } =
    useQuery<Address | null>({
      queryKey: ["proxy-check", contractAddress, chainId, publicClient],
      queryFn: () => {
        if (!contractAddress) return null

        return isProxyContract(publicClient, contractAddress)
          .then((isProxy) => {
            if (!isProxy) return null
            return getImplementation(publicClient, contractAddress)
          })
          .catch(() => null)
      },
      retry: 4,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retryOnMount: true,
      staleTime: Infinity,
    })

  const resolvedAddress =
    isAddress(implementationAddress) && implementationAddress !== zeroAddress
      ? implementationAddress
      : contractAddress

  const {
    data: abi,
    isLoading,
    error,
  } = useQuery<AbiFunction[], Error>({
    queryKey: ["abi", resolvedAddress || "", chainId, publicClient],
    queryFn: () => {
      if (!resolvedAddress || !isAddress(resolvedAddress)) {
        return Promise.resolve([])
      }

      return whatsabi
        .autoload(resolvedAddress, {
          provider: publicClient,
          abiLoader: getEtherscanAbiLoader(chainId),
          followProxies: false,
          enableExperimentalMetadata: true,
          onProgress: console.log,
        })
        .then(({ abi }) => {
          const functionItems: AbiFunction[] = []
          for (const item of abi) {
            if (item.type === "event") continue

            functionItems.push({
              name: (item as any).name ?? "(function)",
              inputs: item.inputs ?? [],
              outputs: item.outputs ?? [],
              stateMutability: item.stateMutability || "payable",
              type: item.type,
            })
          }
          functionItems.sort((a, b) => {
            const a_RO = ["pure", "view"].includes(a.stateMutability)
            const b_RO = ["pure", "view"].includes(b.stateMutability)

            if (a_RO === b_RO) return 0
            else if (a_RO) return 1
            else if (b_RO) return -1
            return 0
          })
          return functionItems
        })
        .catch((err) => {
          console.error(err)
          toast({
            title: "Cannot fetch",
            description: "The details of the contract could not be fetched",
            variant: "destructive",
          })
          throw err
        })
    },
    retry: 4,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retryOnMount: true,
    staleTime: Infinity,
  })

  return {
    abi: abi ?? [],
    isLoading: isLoading || isLoadingImpl,
    error,
    isProxy: !!implementationAddress,
    implementation: implementationAddress,
  }
}

function getEtherscanAbiLoader(chainId: number) {
  switch (chainId) {
    case 1:
      return new whatsabi.loaders.MultiABILoader([
        // new whatsabi.loaders.SourcifyABILoader({
        //   chainId: chainId,
        // }),
        new whatsabi.loaders.EtherscanABILoader({
          baseURL: "https://api.etherscan.io/api",
        }),
      ])
    case 137:
      return new whatsabi.loaders.MultiABILoader([
        // new whatsabi.loaders.SourcifyABILoader({
        //   chainId: chainId,
        // }),
        new whatsabi.loaders.EtherscanABILoader({
          baseURL: "https://api.polygonscan.com/api",
        }),
      ])
    case 421614:
      return new whatsabi.loaders.MultiABILoader([
        // new whatsabi.loaders.SourcifyABILoader({
        //   chainId: chainId,
        // }),
        new whatsabi.loaders.EtherscanABILoader({
          baseURL: "https://api-sepolia.arbiscan.io/api",
        }),
      ])
    case 11155111:
      return new whatsabi.loaders.MultiABILoader([
        // new whatsabi.loaders.SourcifyABILoader({
        //   chainId: chainId,
        // }),
        new whatsabi.loaders.EtherscanABILoader({
          baseURL: "https://api-sepolia.etherscan.io/api",
        }),
      ])
    default:
      throw new Error("Unknown chain")
  }
}
