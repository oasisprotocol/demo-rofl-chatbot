import requests
import unittest
from unittest.mock import patch, MagicMock
from ..src.RoflUtility import RoflUtility

class TestRoflUtility(unittest.TestCase):
    tx_params = {
        'value': 0,
        'chainId': 23293,
        'gasPrice': 1000,
        'gas': 1000000,
        'to': '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        'data': '0x7adbf973000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', # setOracle("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
    }

    def setUp(self):
        self.rofl_utility = RoflUtility()
        self.rofl_utility_with_url = RoflUtility("http://test.url")

    @patch('requests.Session')
    def test_fetch_key_local(self, mock_session):
        mock_response = MagicMock()
        mock_response.json.return_value = {"key": "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"}
        mock_session.return_value.post.return_value = mock_response

        result = self.rofl_utility.fetch_key("test_id")

        self.assertEqual(result, "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a")
        mock_session.return_value.post.assert_called_once_with(
            "http://localhost/rofl/v1/keys/generate",
            json={"key_id": "test_id", "kind": "secp256k1"}
        )

    @patch('requests.Session')
    def test_fetch_key_remote(self, mock_session):
        mock_response = MagicMock()
        mock_response.json.return_value = {"key": "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"}
        mock_session.return_value.post.return_value = mock_response

        result = self.rofl_utility_with_url.fetch_key("test_id")

        self.assertEqual(result, "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a")
        mock_session.return_value.post.assert_called_once_with(
            "http://test.url/rofl/v1/keys/generate",
            json={"key_id": "test_id", "kind": "secp256k1"}
        )

    @patch('requests.Session')
    def test_submit_tx_local(self, mock_session):
        mock_response = MagicMock()
        mock_response.json.return_value = {"transaction_hash": "0x1279a4718c02a5d3ca68f68b234b7dcdbe0e41892ea3217235b98810f97dedf7"}
        mock_session.return_value.post.return_value = mock_response

        result = self.rofl_utility.submit_tx(self.tx_params)

        self.assertEqual(result, {"transaction_hash": "0x1279a4718c02a5d3ca68f68b234b7dcdbe0e41892ea3217235b98810f97dedf7"})
        mock_session.return_value.post.assert_called_once_with(
            "http://localhost/rofl/v1/tx/sign-submit",
            json={"tx": {"eth": self.tx_params}, "encrypt": False}
        )

    @patch('requests.Session')
    def test_submit_tx_remote(self, mock_session):
        mock_response = MagicMock()
        mock_response.json.return_value = {"transaction_hash": "0x1279a4718c02a5d3ca68f68b234b7dcdbe0e41892ea3217235b98810f97dedf7"}
        mock_session.return_value.post.return_value = mock_response

        result = self.rofl_utility_with_url.submit_tx(self.tx_params)

        self.assertEqual(result, {"transaction_hash": "0x1279a4718c02a5d3ca68f68b234b7dcdbe0e41892ea3217235b98810f97dedf7"})
        mock_session.return_value.post.assert_called_once_with(
            "http://test.url/rofl/v1/tx/sign-submit",
            json={"tx": {"eth": self.tx_params}, "encrypt": False}
        )

    @patch('requests.Session')
    def test_fetch_key_error_handling(self, mock_session):
        mock_session.return_value.post.side_effect = requests.exceptions.RequestException

        with self.assertRaises(requests.exceptions.RequestException):
            self.rofl_utility.fetch_key("test_id")

    @patch('requests.Session')
    def test_submit_tx_error_handling(self, mock_session):
        mock_session.return_value.post.side_effect = requests.exceptions.RequestException

        with self.assertRaises(requests.exceptions.RequestException):
            self.rofl_utility.submit_tx(self.tx_params)

if __name__ == '__main__':
    unittest.main()