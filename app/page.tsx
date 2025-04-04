"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCode, faUser } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export default function Home() {
 
  const router = useRouter();
    const [showDialog, setShowDialog] = useState(false);
    const [transactionId, setTransactionId] = useState("");
  
    const handleDeveloperLogin = async () => {
      router.push("/developer-login");
    };
  
    const handleUserClick = () => {
      setShowDialog(true);
    };
  
    const handleGoTo = () => {
      if (transactionId) {
        router.push(`/execute-transaction?transactionId=${transactionId}`);
      } else {
        toast.error("Please enter a transaction ID");
      }
    };


    return (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card
          onClick={handleDeveloperLogin}
          className="flex flex-col items-center p-10 bg-white shadow-lg rounded-2xl hover:shadow-xl transition w-64 h-80 cursor-pointer"
        >
          <FontAwesomeIcon icon={faCode} className="text-[150px] mb-auto" />
          <CardFooter>
            <h2 className="text-xl font-semibold mt-auto">Developer</h2>
          </CardFooter>
        </Card>
        <Card
          onClick={handleUserClick}
          className="flex flex-col items-center p-10 bg-white shadow-lg rounded-2xl hover:shadow-xl transition w-64 h-80 cursor-pointer"
        >
          <FontAwesomeIcon icon={faUser} className="text-[150px] mb-auto" />
          <CardFooter>
            <h2 className="text-xl font-semibold mt-auto">User</h2>
          </CardFooter>
        </Card>
      </div>

      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Please provide your transaction ID</DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Enter Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <Button onClick={handleGoTo} className="mt-4">
              Go To
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-[20px] mb-auto"
              />
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
