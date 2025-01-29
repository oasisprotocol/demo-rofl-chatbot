# Oasis Chat bot oracle

1. Install dependencies

   ```shell
   pip install -r requirements.txt
   ```

2. Make sure you have your contracts compiled and ABIs ready in
   ../contracts/out/ChatBot.sol/ChatBot.json
   and deployed.

3. For Localnet, run the oracle with
   
   ```shell
   ./main.py --secret 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```
   
   For Mainnet/Testnet where TEE and ROFL app's key management service is up
   and running, simply run it with
   
   ```shell
   ./main.py 0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```

