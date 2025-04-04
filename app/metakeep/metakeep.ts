import { MetaKeep } from "metakeep";

const sdk = new MetaKeep({
  appId: process.env.APP_ID || '',
});


export default sdk;