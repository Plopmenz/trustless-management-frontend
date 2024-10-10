export const EthFowardContract = {
  address: "0xf2Ed938FA25e7AC8EacD5C8753E85f5fd83ab650",
  abi: [
    {
      type: "function",
      name: "forward",
      inputs: [
        { name: "receiver", type: "address", internalType: "address payable" },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "event",
      name: "Forwarded",
      inputs: [
        {
          name: "from",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "receiver",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "value",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "error",
      name: "ForwardFailed",
      inputs: [
        { name: "from", type: "address", internalType: "address" },
        { name: "receiver", type: "address", internalType: "address" },
        { name: "value", type: "uint256", internalType: "uint256" },
      ],
    },
  ],
} as const
