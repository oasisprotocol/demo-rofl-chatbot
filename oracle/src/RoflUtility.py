import requests
import requests_unixsocket
from web3.types import TxParams

class RoflUtility:
    def __init__(self, url: str):
        self.url = url

    def fetch_key(self, id: str) -> str:
        payload = {
            "key_id": id,
            "kind": "secp256k1"
        }

        s: requests.Session
        url = self.url
        if url.startswith('http+unix:') or url.startswith('unix:'):
            s = requests_unixsocket.Session()
            url = url.replace('/', '%2F')
            url = url.replace('unix:%2F%2F', 'unix://')
        else:
            s = requests.Session()

        path = '/rofl/v1/keys/generate'
        print(f"Fetching oracle key from {url+path}")
        response = s.post(url+path, json=payload)
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

        s: requests.Session
        url = self.url
        if url.startswith('http+unix:') or url.startswith('unix:'):
            s = requests_unixsocket.Session()
            url = url.replace('/', '%2F')
            url = url.replace('unix:%2F%2F', 'unix://')
        else:
            s = requests.Session()

        path = '/rofl/v1/tx/sign-submit'
        print(f"Submitting {payload} from {url+path}")
        response = s.post(url+path, json=payload)
        response.raise_for_status()
        return response.json()
