from web3 import Web3
from web3.middleware import construct_sign_and_send_raw_middleware
from eth_account.signers.local import LocalAccount
from eth_account import Account
from sapphirepy import sapphire
import json
from pathlib import Path

def setup_web3_middleware(network: str, PRIVATE_KEY: str) -> Web3:
    if not all([PRIVATE_KEY, ]):
        raise Warning(
            "Missing required environment variables. Please set PRIVATE_KEY.")

    account: LocalAccount = Account.from_key(
        PRIVATE_KEY)
    provider = Web3.WebsocketProvider(network) if network.startswith("ws:") else Web3.HTTPProvider(network)
    w3 = Web3(provider)
    w3.middleware_onion.add(construct_sign_and_send_raw_middleware(account))
    w3 = sapphire.wrap(w3, account)
    # w3.eth.set_gas_price_strategy(rpc_gas_price_strategy)
    w3.eth.default_account = account.address
    return w3


def process_json_file(filepath, mode="r", data=None):
    with open(filepath, mode) as file:
        if mode == "r":
            return json.load(file)
        elif mode == "w" and data:
            json.dump(data, file)


def get_contract(contract_name: str):
    output_path = (Path(__file__).parent.parent.parent / "contracts" / "out" / f"{contract_name}.sol" / f"{contract_name}.json").resolve()
    contract_data = process_json_file(output_path)
    abi, bytecode = contract_data["abi"], contract_data["bytecode"]["object"]
    return abi, bytecode


