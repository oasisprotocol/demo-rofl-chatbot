#!/usr/bin/env python3

from src.ChatBotOracle import ChatBotOracle
from src.utils import fetch_oracle_key
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
        "--kms",
        help="ROFL Key Management Service URL",
        default="http://localhost/rofl/v1/keys/generate",
    )

    parser.add_argument(
        "--key-id",
        help="Key ID for looking it up on the KMS",
        default="chatbot",
    )

    parser.add_argument(
        "--secret",
        help="Secret key of the oracle account (only for testing)",
        required=False,
    )

    arguments = parser.parse_args()

    secret = arguments.secret
    if secret == None:
        secret = fetch_oracle_key(arguments.key_id, arguments.kms)

    chatBotOracle = ChatBotOracle(arguments.contract_address, arguments.network, secret)
    chatBotOracle.run()

if __name__ == '__main__':
    main()
