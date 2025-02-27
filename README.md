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

## Prerequisites

The easiest way to spin up all components described above is to use:

- [Podman] version 4.9.x or above
- [Podman Compose] version 1.3.x or above

[Podman]: https://podman.io/
[Podman Compose]: https://github.com/containers/podman-compose

## Localnet deployment


```shell
podman-compose -f compose.localnet.yaml up
```

Once all containers are up and running, open your web browser at
`http://localnet:5173`.

## Testnet deployment

1. `podman build -f Dockerfile.oracle -t ghcr.io/oasisprotocol/demo-rofl-chatbot:latest .`

3. `podman push --digestfile demo-rofl-chatbot.default.orc.digest ghcr.io/oasisprotocol/demo-rofl-chatbot:latest`

4. Update `compose.yaml` `services.oracle.image` field with
   `ghcr.io/oasisprotocol/demo-rofl-chatbot:latest@sha256:` followed by the content of
   `demo-rofl-chatbot.default.orc.digest`

5. `oasis rofl build --update-manifest`

6. `oasis rofl update`

7. Copy over `demo-rofl-chatbot.default.orc` to your [Oasis node]

8. Add a path to your .orc file to `runtime.paths` in `config.yml` of your
   Oasis node and restart it.

9. `cd frontend; yarn; yarn build` and copy the content of `dist` folder to the
   root of your web server.

[Oasis node]: https://docs.oasis.io/node/run-your-node/paratime-client-node#configuring-tee-paratime-client-node

### Troubleshooting

- In case of persistent storage image redundancy error on your Oasis node,
  remove the
  `/serverdir/runtimes/images/000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c/rofl.rofl1qrtetspnld9efpeasxmryl6nw9mgllr0euls3dwn/`
  folder.

