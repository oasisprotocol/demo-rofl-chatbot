import httpx
import typing
from web3.types import TxParams


class RoflUtility:
    ROFL_SOCKET_PATH = "/run/rofl-appd.sock"

    def __init__(self, url: str = ''):
        self.url = url

    def _appd_post(self, path: str, payload: typing.Any) -> typing.Any:
        transport = None
        if self.url and not self.url.startswith('http'):
            transport = httpx.HTTPTransport(uds=self.url)
        elif not self.url:
            transport = httpx.HTTPTransport(uds=self.ROFL_SOCKET_PATH)

        client = httpx.Client(transport=transport)

        url = self.url if self.url and self.url.startswith('http') else "http://localhost"
        response = client.post(url + path, json=payload)
        response.raise_for_status()
        return response.json()

    def fetch_key(self, id: str) -> str:
        payload = {
            "key_id": id,
            "kind": "secp256k1"
        }

        path = '/rofl/v1/keys/generate'

        print(f"Fetching oracle key from {self.url+path}")

        response = self._appd_post(path, payload)
        return response["key"]

    def submit_tx(self, tx: TxParams) -> str:
        payload = {
            "tx": {
                "eth": {
                    **tx
                }
            },
            "encrypt": False
        }

        path = '/rofl/v1/tx/sign-submit'

        print(f"Submitting {payload} to {self.url+path}")

        return self._appd_post(path, payload)