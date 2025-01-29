use oasis_runtime_sdk::modules::rofl::app::prelude::*;

/// Address where the chatbot contract is deployed.
const CHATBOT_CONTRACT_ADDRESS: &str = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Localnet

struct OracleApp;

#[async_trait]
impl App for OracleApp {
    /// Application version.
    const VERSION: Version = sdk::version_from_cargo!();

    /// Identifier of the application (used for registrations).
    // #region app-id
    fn id() -> AppId {
        "rofl1qrtetspnld9efpeasxmryl6nw9mgllr0euls3dwn".into() // TODO: Replace with your application ID.
    }
    // #endregion app-id

    /// Return the consensus layer trust root for this runtime; if `None`, consensus layer integrity
    /// verification will not be performed (e.g. Localnet).
    // #region consensus-trust-root
    fn consensus_trust_root() -> Option<TrustRoot> {
        // The trust root below is for Sapphire Testnet at consensus height 22110615.
        Some(TrustRoot {
            height: 22110615,
            hash: "95d1501f9cb88619050a5b422270929164ce739c5d803ed9500285b3b040985e".into(),
            runtime_id: "000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c".into(),
            chain_context: "0b91b8e4e44b2003a7c5e23ddadb5e14ef5345c0ebcb3ddcae07fa2f244cab76"
                .to_string(),
        })
    }
    // #endregion consensus-trust-root

    async fn run(self: Arc<Self>, env: Environment<Self>) {
        // We are running now!
        println!("Bootstrapping Oracle...");

        // Request the secret key from the key generation service
        let client = reqwest::Client::new();
        let response = client
            .post("http://localhost/rofl/v1/keys/generate")
            .json(&serde_json::json!({
                "key_id": "chatbot",
                "kind": "secp256k1"
            }))
            .send()
            .await?;

        let json: serde_json::Value = response.json().await?;
        let secret_key_hex = json["key"].as_str().unwrap();

        println!("DEBUG: obtained key {}", secret_key_hex);

        // Convert hex to secret key bytes
        let secret_key_bytes = hex::decode(secret_key_hex.trim_start_matches("0x")).unwrap();
        let secret_key = k256::SecretKey::from_slice(&secret_key_bytes).unwrap();

        // Derive the Ethereum address
        let public_key = secret_key.public_key();
        let public_key_bytes = public_key.to_encoded_point(false).as_bytes();
        let hash = ethers_core::utils::keccak256(&public_key_bytes[1..]);
        let eth_address = format!("0x{}", hex::encode(&hash[12..]));

        println!("Generated Ethereum address: {}", eth_address);

        // Create transaction to set oracle address
        let mut tx = self.new_transaction(
            "evm.Call",
            module_evm::types::Call {
                address: CHATBOT_CONTRACT_ADDRESS.parse().unwrap(),
                value: 0.into(),
                data: [
                    ethabi::short_signature("setOracle", &[ethabi::ParamType::Address]).to_vec(),
                    ethabi::encode(&[ethabi::Token::Address(eth_address.parse().unwrap())]),
                ]
                    .concat(),
            },
        );
        tx.set_fee_gas(200_000);

        // Submit transaction
        env.client().sign_and_submit_tx(env.signer(), tx).await?;  // Prepare the oracle contract call.

        println!("Successfully assigned oracle address.");
    }
}

impl OracleApp {}

fn main() {
    OracleApp.start();
}
