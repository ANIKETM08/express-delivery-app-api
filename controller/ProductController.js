const braintree = require("braintree");

//payment gateway

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.Merchant_ID,
  publicKey: process.env.Public_Key,
  privateKey: process.env.Private_Key,
});
