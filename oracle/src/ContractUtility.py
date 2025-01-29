import os
from pathlib import Path
from solcx import compile_standard, install_solc
from eth_account.signers.local import LocalAccount
from eth_account import Account

from src.utils import setup_web3_middleware, get_contract, process_json_file, fetch_oracle_key


class ContractUtility:
    """
    Initializes the ContractUtility class.

    :param network_name: Name of the network to connect to
    :type network_name: str
    :return: None
    """

    def __init__(self, network_name: str, secret: str):
        networks = {
            "sapphire": "https://sapphire.oasis.io",
            "sapphire-testnet": "https://testnet.sapphire.oasis.io",
            "sapphire-localnet": "http://localhost:8545",
        }
        network = networks[network_name] if network_name in networks else network_name
        self.w3 = setup_web3_middleware(network, secret)
