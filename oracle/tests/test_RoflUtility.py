import httpx
import unittest
from unittest.mock import patch, MagicMock
from web3.types import TxParams
import socket
import threading
import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

from ..src.RoflUtility import RoflUtility

class TestRoflUtility(unittest.TestCase):
    tx_params: TxParams = {
        'value': 0,
        'chainId': 23293,
        'gasPrice': 1000,
        'gas': 1000000,
        'to': '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        'data': '0x7adbf973000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', # setOracle("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
    }

    def setUp(self):
        socket_path = "/tmp/appd_test_socket.sock"

        class UnixSocketHTTPServer(HTTPServer):
            def server_bind(self):
                if os.path.exists(self.server_address):
                    os.unlink(self.server_address)
                self.socket = socket.socket(socket.AF_UNIX)
                self.socket.bind(self.server_address)
                self.server_address = self.server_address
                self.socket.listen(1)

        class MockHandler(BaseHTTPRequestHandler):
            def do_POST(self):
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                request_json = json.loads(post_data.decode('utf-8'))

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()

                if self.path == '/rofl/v1/keys/generate':
                    response = {"key": "test_key"}
                elif self.path == '/rofl/v1/tx/sign-submit':
                    response = {"txHash": "0x123"}
                else:
                    response = {"error": "Not found"}

                self.wfile.write(json.dumps(response).encode())

        # Start server in a separate thread
        server = UnixSocketHTTPServer(socket_path, MockHandler)
        server_thread = threading.Thread(target=server.serve_forever)
        server_thread.daemon = True
        server_thread.start()

        # Cleanup
        self.addCleanup(server.shutdown)
        self.addCleanup(server.server_close)
        self.addCleanup(lambda: os.unlink(socket_path) if os.path.exists(socket_path) else None)

        self.rofl_utility = RoflUtility(socket_path)

    #@patch('httpx.Client')
    def test_fetch_key(self):
        # Setup mock
        # mock_response = MagicMock()
        # mock_response.json.return_value = {"key": "test_key"}
        # mock_instance = mock_client.return_value
        # mock_instance.post.return_value = mock_response

        # Test with default URL
        key = self.rofl_utility.fetch_key("test_id")
        self.assertEqual(key, "test_key")
        # mock_instance.post.assert_called_with(
        #     "http://localhost/rofl/v1/keys/generate",
        #     json={"key_id": "test_id", "kind": "secp256k1"}
        # )

    #@patch('httpx.Client')
    def test_submit_tx(self):
        # Setup mock
        # mock_response = MagicMock()
        # mock_response.json.return_value = {"txHash": "0x123"}
        # mock_instance = mock_client.return_value
        # mock_instance.post.return_value = mock_response

        # Test with default URL
        result = self.rofl_utility.submit_tx(self.tx_params)
        self.assertEqual(result, {"txHash": "0x123"})
        # mock_instance.post.assert_called_with(
        #     "http://localhost/rofl/v1/tx/sign-submit",
        #     json={"tx": {"eth": self.tx_params}, "encrypt": False}
        # )

    @patch('httpx.Client')
    def test_error_handling(self, mock_client):
        # Setup mock to raise an error
        mock_instance = mock_client.return_value
        mock_instance.post.side_effect = httpx.HTTPError("Test error")

        # Test error handling in fetch_key
        with self.assertRaises(httpx.HTTPError):
            self.rofl_utility.fetch_key("test_id")

        # Test error handling in submit_tx, no gas
        with self.assertRaises(httpx.HTTPError):
            self.rofl_utility.submit_tx({"gas": 0, "to": "0x123", "value": 1000, "data": ""})

if __name__ == '__main__':
    unittest.main()