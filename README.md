# Demo Chatbot running on Oasis ROFL

This is a simple showcase of a ollama-based chatbot running inside Oasis ROFL
TDX.

It consists of the following components:

- `contracts` contains the Sapphire smart contract which confidentially stores
  the prompts and answers. It also makes sure that only an authorized TEE-based
  Oracle is allowed to read prompts and write answers back.
- `oracle` a python-based oracle running inside a ROFL TEE that listens for a
  prompt on the Sapphire smart contract, relays it to the ollama service and
  writes the answer back to the smart contract.
- `ollama` is a chat bot running inside a ROFL TEE that waits a prompt from
  `oracle`, generates a response using a preconfigured model and returns it.
- `frontend` is a react-based frontend that makes sure the user is properly
  logged in via Sign-In With Ethereum (SIWE) protocol and makes sure the user's
  prompt is end-to-end encrypted when submitted to the Sapphire chain.

***NOTE:*** If you just cloned this folder, don't forget to also fetch the
submodules:

```shell
git submodule init
git submodule update
```

## Localnet deployment

```shell
docker compose -f compose.localnet.yaml up
```

Open your web browser at `http://localnet:5173`.


## Testnet deployment

1. `oasis rofl build`

2. Enable the ROFL app ID in your `oasis-node`
