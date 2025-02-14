import requests
from requests.adapters import HTTPAdapter
import socket
from urllib3.connection import HTTPConnection
from urllib3.connectionpool import HTTPConnectionPool
from web3.types import TxParams


# Hack to enable HTTP connection over unix socket:
class RoflConnection(HTTPConnection):
    def __init__(self):
        super().__init__("localhost")

    def connect(self):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.connect("/run/rofl-appd.sock")


class RoflConnectionPool(HTTPConnectionPool):
    def __init__(self):
        super().__init__("localhost")

    def _new_conn(self):
        return RoflConnection()


class RoflAdapter(HTTPAdapter):
    def get_connection_with_tls_context(self, request, verify, proxies=None, cert=None):
        return RoflConnectionPool()


class RoflUtility:
    def __init__(self, url: str = ''):
        self.url = url

    def fetch_key(self, id: str) -> str:
        payload = {
            "key_id": id,
            "kind": "secp256k1"
        }

        s = requests.Session()
        url = self.url
        if not self.url:
            url = "http://localhost"
            s.mount(url, RoflAdapter())

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

        s = requests.Session()
        url = self.url
        if not self.url:
            url = "http://localhost"
            s.mount(url, RoflAdapter())

        path = '/rofl/v1/tx/sign-submit'
        print(f"Submitting {payload} to {url+path}")
        response = s.post(url+path, json=payload)
        response.raise_for_status()
        return response.json()
