export type ContractData = {
  contractAddress: string;
  chainId: string;
  rpcUrl: string;
  contractABIFunc: JSON[];
};

export type ContractFunction = {
    contract: ContractData,
    functionName: string,
    params: string[];
}