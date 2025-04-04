"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ethers } from "ethers";
import { ContractFunction } from "../types/type";
import { decryptData } from "../utils/crypto";
import sdk from "../metakeep/metakeep";
import { toast } from "sonner";

const Transaction = () => {
  const searchParams = useSearchParams();
  const [transactionData, setTransactionData] = useState<ContractFunction | null>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider>();
  const [error, setError] = useState<string | null>(null);
  const [signedTx, setSignedTx] = useState<any>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      const transactionId = searchParams.get("transactionId");
      if (!transactionId) return;
      try {
        const decryptedData = decryptData(transactionId);
        setTransactionData(decryptedData);
        const tx = await getTransactionData(decryptedData);
        setTransaction(tx);
        setLoading(false);
      } catch (err) {
        console.error("Decryption failed:", err);
        setError("Transaction ID Invalid");
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [searchParams]);

  const getTransactionData = async (transactionData: ContractFunction) => {
    const wallet = await sdk.getWallet();
    const provider = new ethers.JsonRpcProvider(transactionData.contract.rpcUrl);
    setProvider(provider);
    const latestBlock = await provider.getBlock("latest");
    const transactionType = latestBlock?.baseFeePerGas ? 2 : 0;

    if (!transactionData.contract.contractABIFunc || !transactionData.functionName || !transactionData.params) {
      throw new Error("Invalid transaction data");
    }

    const iface = new ethers.Interface(transactionData.contract.contractABIFunc as ethers.InterfaceAbi);
    const encodedData = iface.encodeFunctionData(transactionData.functionName, transactionData.params);

    const userEthAddress = wallet.wallet.ethAddress;
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    const nonce = await provider.getTransactionCount(userEthAddress);

    let estimatedGas;
    try {
      estimatedGas = await provider.estimateGas({ to: transactionData.contract.contractAddress, data: encodedData });
    } catch (error) {
      console.error("⚠️ Gas estimation failed:", error);
      estimatedGas = "Estimation failed";
    }

    return {
      type: transactionType,
      from: userEthAddress,
      to: transactionData.contract.contractAddress,
      value: "0x0",
      nonce: ethers.toBeHex(nonce),
      data: encodedData,
      gas: ethers.toBeHex(estimatedGas),
      maxFeePerGas: ethers.toBeHex(1000000000),
      maxPriorityFeePerGas: ethers.toBeHex(100000000),
      chainId: ethers.toBeHex(Number(chainId)),
    };
  };

  async function signTransaction(transaction: any, provider: ethers.JsonRpcProvider) {
    try {
      const signedTx = await sdk.signTransaction(transaction, "Signing transaction");
      setSignedTx(signedTx);
      toast.success("Transaction Signed Successfully!");
    } catch (error) {
      toast.error("Transaction Signing Failed!", { description: String(error) });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      {loading ? (
        <Skeleton className="h-24 w-96" />
      ) : error ? (
        <p className="text-red-500 font-bold">{error}</p>
      ) : signedTx ? (
        <div className="p-6 border rounded-lg shadow-md bg-white max-w-4xl w-full">
          <p className="text-green-600 font-medium mb-2">✅ Your transaction is successfully signed!</p>
          <h2 className="text-lg font-bold mb-2">Signed Transaction Details:</h2>
          <pre className="bg-gray-300 p-4 rounded-2xl text-sm whitespace-pre-wrap break-words">
            {JSON.stringify(signedTx, null, 2)}
          </pre>
        </div>
      ) : (
        <>
          <div className="p-6 border rounded-lg shadow-md bg-white max-w-4xl w-full">
            <h2 className="text-lg font-bold mb-4">Transaction Overview:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-300 w-full p-4 rounded-2xl">
              <div>
                <p><strong>Contract Address:</strong> {transactionData?.contract.contractAddress}</p>
                <p><strong>Function Name:</strong> {transactionData?.functionName}</p>
                <p><strong>Parameters:</strong> {JSON.stringify(transactionData?.params)}</p>
                <p><strong>Chain ID:</strong> {transactionData?.contract.chainId}</p>
                <p><strong>RPC URL:</strong> {transactionData?.contract.rpcUrl}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg shadow-md bg-white max-w-4xl overflow-auto">
            <h2 className="text-lg font-bold mb-2">Transaction:</h2>
            <pre className="bg-gray-300 p-4 rounded-2xl text-sm whitespace-pre-wrap break-words">
              {JSON.stringify(transaction, null, 2)}
            </pre>
          </div>

          <Button onClick={() => signTransaction(transaction, provider!)} className="p-4 rounded-lg cursor-pointer">
            Sign Transaction
          </Button>
        </>
      )}
    </div>
  );
};

export default Transaction;
