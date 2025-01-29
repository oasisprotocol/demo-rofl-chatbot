# Chat bot contracts

To deploy on the Localnet run:

```bash
forge create \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    --rpc-url http://localhost:8545 \
    --broadcast \
    ChatBot \
    --constructor-args localhost 00d795c033fb4b94873d81b6327f5371768ffc6fcf 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

You can then submit a prompt from the CLI by issuing:

```bash
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
    "appendPrompt(string)" "hello" \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
