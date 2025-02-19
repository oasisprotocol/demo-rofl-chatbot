import httpx
from web3.types import TxParams


class RoflUtility:
    ROFL_SOCKET_PATH = "/run/rofl-appd.sock"

    def __init__(self, url: str = ''):
        self.url = url

    def fetch_key(self, id: str) -> str:
        payload = {
            "key_id": id,
            "kind": "secp256k1"
        }

        url = self.url if self.url else "http://localhost"
        path = '/rofl/v1/keys/generate'

        print(f"Fetching oracle key from {url+path}")

        if not self.url:
            transport = httpx.HTTPTransport(uds=self.ROFL_SOCKET_PATH)
            client = httpx.Client(transport=transport)
        else:
            client = httpx.Client()

        response = client.post(url + path, json=payload)
        response.raise_for_status()
        return response.json()["key"]

    def submit_tx(self, tx: TxParams) -> str:
        payload = {
            "tx": {
                "eth": {
                    **tx
                }
            },
            "encrypt": False
        }

        url = self.url if self.url else "http://localhost"
        path = '/rofl/v1/tx/sign-submit'

        print(f"Submitting {payload} to {url+path}")

        if not self.url:
            transport = httpx.HTTPTransport(uds=self.ROFL_SOCKET_PATH)
            client = httpx.Client(transport=transport)
        else:
            client = httpx.Client()

        response = client.post(url + path, json=payload)
        response.raise_for_status()
        return response.json()
