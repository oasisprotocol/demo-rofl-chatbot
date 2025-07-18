# Chat bot contracts

## Localnet

Localnet has hardcoded accounts and ROFL app ids, so you can simply run:

```shell
forge create \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    --rpc-url http://localhost:8545 \
    --broadcast \
    ChatBot \
    --constructor-args localhost 00d795c033fb4b94873d81b6327f5371768ffc6fcf 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

You can then submit a prompt from the CLI by issuing:

```shell
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
    "appendPrompt(string)" "hello" \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    --rpc-url http://localhost:8545
```

## Testnet and Mainnet

First convert your `rofl1` app ID to hex, for example by using
https://slowli.github.io/bech32-buffer/

Then deploy the contract with your hex-encoded app ID and zero oracle account.
The oracle account will be configured inside the ROFL TEE the first time it
boots to ensure traceability:

```shell
forge create --private-key YOUR_PRIVATE_KEY \
  --rpc-url https://testnet.sapphire.oasis.io \
  --broadcast \
  ChatBot \
  --constructor-args your-domain.com YOUR_APP_ID_IN_HEX 0x0000000000000000000000000000000000000000
```

For Mainnet deployment, deploy with your Mainnet app ID, account, domain and
`--rpc-url https://sapphire.oasis.io` parameter.
