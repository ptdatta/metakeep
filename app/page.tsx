"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContractData, ContractFunction } from "./types/type";
import { encryptData } from "./utils/crypto";
import { toast } from "sonner";

export default function Home() {
  const [contractData, setContractData] = useState<ContractData>({
    contractAddress: "",
    chainId: "",
    rpcUrl: "",
    contractABIFunc: [],
  });
  const [abiFunctions, setAbiFunctions] = useState<any[]>([]);
  const [inputs, setInputs] = useState<{ [key: string]: string[] }>({});
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [transactionLink, setTransactionLink] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const abi = JSON.parse(e.target?.result as string);
          const functions = abi.filter((item: any) => item.type === "function");
          setAbiFunctions(functions);
          const initialInputs: { [key: string]: string[] } = {};
          functions.forEach((func: any) => {
            initialInputs[func.name] = new Array(func.inputs.length).fill("");
          });
          setInputs(initialInputs);
        } catch (error) {
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(selectedFile);
    } else {
      alert("Please upload a valid JSON file.");
    }
  };

  const handleInputChange = (
    funcName: string,
    index: number,
    value: string
  ) => {
    setInputs((prev) => ({
      ...prev,
      [funcName]: prev[funcName].map((val, i) => (i === index ? value : val)),
    }));
  };

  const handleExecute = (funcName: string) => {
    const params = inputs[funcName];
    const selectedFunctionABI = abiFunctions.find(
      (func) => func.name === funcName
    );
    const transactionData: ContractFunction = {
      contract: {
        ...contractData,
        contractABIFunc: [selectedFunctionABI],
      },
      functionName: funcName,
      params: params,
    };
    const link = `http://localhost:3000/execute-transaction?transactionId=${encryptData(
      transactionData
    )}`;
    setTransactionLink(link);
    setShowDialog(true);
  };

  const openDrawer = () => {
    if(abiFunctions.length === 0) {
      toast.error("Please upload a valid ABI file.");
      return;
    } else {
      setShowDrawer(true);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent>
          <h1 className="text-2xl font-bold text-center mb-4">
            Upload ABI & Enter Details
          </h1>
          <Input
            type="text"
            placeholder="Contract Address"
            value={contractData.contractAddress}
            onChange={(e) =>
              setContractData((prev) => ({
                ...prev,
                contractAddress: e.target.value,
              }))
            }
            required
            className="mb-4"
          />
          <Input
            type="text"
            placeholder="Chain ID"
            value={contractData.chainId}
            onChange={(e) =>
              setContractData((prev) => ({ ...prev, chainId: e.target.value }))
            }
            required
            className="mb-4"
          />
          <Input
            type="text"
            placeholder="RPC URL"
            value={contractData.rpcUrl}
            onChange={(e) =>
              setContractData((prev) => ({ ...prev, rpcUrl: e.target.value }))
            }
            required
            className="mb-4"
          />
          <Input
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            required
            className="mb-4"
          />
          <Button className="w-full mt-4" onClick={openDrawer}>
            Get Functions
          </Button>
        </CardContent>
      </Card>

      <Drawer open={showDrawer} onOpenChange={setShowDrawer}>
        <DrawerContent className="p-6 px-[100px] overflow-y-scroll">
          <DrawerHeader>
            <DrawerTitle>Select ABI Function</DrawerTitle>
          </DrawerHeader>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {abiFunctions.map((func, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg p-4 mb-6 cursor-pointer"
              >
                <AccordionTrigger className="text-lg font-bold">
                  {func.name}
                </AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  {func.inputs.length > 0 ? (
                    func.inputs.map((input: any, i: number) => (
                      <Input
                        key={i}
                        type="text"
                        placeholder={`${input.name || "param"} (${input.type})`}
                        value={inputs[func.name]?.[i] || ""}
                        onChange={(e) =>
                          handleInputChange(func.name, i, e.target.value)
                        }
                        className="w-full"
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No Inputs</p>
                  )}
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleExecute(func.name)}
                  >
                    Execute
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </DrawerContent>
      </Drawer>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Link</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-300 p-4 rounded-lg">
            <p className="text-sm break-all">{transactionLink}</p>
          </div>
          <Button
            className="mt-4"
            onClick={() => navigator.clipboard.writeText(transactionLink)}
          >
            Copy
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
