import httpx
import unittest
from unittest.mock import patch, MagicMock
from web3.types import TxParams

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
        self.rofl_utility = RoflUtility()
        self.rofl_utility_with_url = RoflUtility("http://test.com")

    @patch('httpx.Client')
    def test_fetch_key(self, mock_client):
        # Setup mock
        mock_response = MagicMock()
        mock_response.json.return_value = {"key": "test_key"}
        mock_instance = mock_client.return_value
        mock_instance.post.return_value = mock_response

        # Test with default URL
        key = self.rofl_utility.fetch_key("test_id")
        self.assertEqual(key, "test_key")
        mock_instance.post.assert_called_with(
            "http://localhost/rofl/v1/keys/generate",
            json={"key_id": "test_id", "kind": "secp256k1"}
        )

    @patch('httpx.Client')
    def test_submit_tx(self, mock_client):
        # Setup mock
        mock_response = MagicMock()
        mock_response.json.return_value = {"txHash": "0x123"}
        mock_instance = mock_client.return_value
        mock_instance.post.return_value = mock_response

        # Test with default URL
        result = self.rofl_utility.submit_tx(self.tx_params)
        self.assertEqual(result, {"txHash": "0x123"})
        mock_instance.post.assert_called_with(
            "http://localhost/rofl/v1/tx/sign-submit",
            json={"tx": {"eth": self.tx_params}, "encrypt": False}
        )

    @patch('httpx.Client')
    def test_error_handling(self, mock_client):
        # Setup mock to raise an error
        mock_instance = mock_client.return_value
        mock_instance.post.side_effect = httpx.HTTPError("Test error")

        # Test error handling in fetch_key
        with self.assertRaises(httpx.HTTPError):
            self.rofl_utility.fetch_key("test_id")

        # Test error handling in submit_tx
        with self.assertRaises(httpx.HTTPError):
            self.rofl_utility.submit_tx({"to": "0x123", "value": 1000})

if __name__ == '__main__':
    unittest.main()