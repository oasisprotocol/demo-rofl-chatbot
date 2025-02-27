#!/usr/bin/env python3

from src.ChatBotOracle import ChatBotOracle
from src.RoflUtility import RoflUtility
import argparse

def main():
    """
    Main method for the Python CLI tool.

    :return: None
    """
    parser = argparse.ArgumentParser(description="A Python CLI tool for compiling, deploying, and interacting with smart contracts.")

    parser.add_argument(
        "contract_address",
        type=str,
        help="Address of the smart contract to interact with"
    )

    parser.add_argument(
        "--network",
        help="Chain name to connect to "
             "(sapphire, sapphire-testnet, sapphire-localnet)",
        default="sapphire-localnet",
    )

    parser.add_argument(
        "--ollama-address",
        help="Host running the ollama service",
        default="http://localhost:11434",
    )

    parser.add_argument(
        "--kms",
        help="Override ROFL's appd service URL",
        default="",
    )

    parser.add_argument(
        "--key-id",
        help="Override the oracle's secret key ID on KMS",
        default="chatbot-oracle",
    )

    parser.add_argument(
        "--secret",
        help="Secret key of the oracle account (only for testing)",
        required=False,
    )

    arguments = parser.parse_args()

    print(f"Starting ChatBot Oracle service. Using contract {arguments.contract_address} on {arguments.network}.")
    rofl_utility = RoflUtility(arguments.kms)

    secret = arguments.secret
    if secret == None:
        secret = rofl_utility.fetch_key(arguments.key_id)

    chatBotOracle = ChatBotOracle(arguments.contract_address, arguments.network, arguments.ollama_address, rofl_utility, secret)
    chatBotOracle.run()

if __name__ == '__main__':
    main()
