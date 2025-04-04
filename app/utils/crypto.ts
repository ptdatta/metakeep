import { AES, enc } from "crypto-js";
import { ContractFunction } from "../types/type";

const decryptData = (transactionId: string): ContractFunction => {
  let decData = enc.Base64.parse(transactionId).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, process.env.SECRET_KEY as string).toString(enc.Utf8);
  return JSON.parse(bytes);
};

const encryptData = (data: ContractFunction) => {
  let encJson = AES.encrypt(JSON.stringify(data), process.env.SECRET_KEY as string).toString();
  let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
  console.log(encData);
  return encData;
};

export { decryptData, encryptData };


// 0xd857b40c152861B2018F8A6796D73bf01BEff829
//