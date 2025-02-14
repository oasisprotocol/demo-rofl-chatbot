import asyncio
import requests

from ollama import Client, ChatResponse

from .ContractUtility import ContractUtility
from .RoflUtility import RoflUtility


class ChatBotOracle:
    def __init__(self,
                 contract_address: str,
                 network_name: str,
                 rofl_utility: RoflUtility,
                 secret: str):
        contract_utility = ContractUtility(network_name, secret)
        abi, bytecode = ContractUtility.get_contract('ChatBot')

        self.rofl_utility = rofl_utility
        self.contract = contract_utility.w3.eth.contract(address=contract_address, abi=abi)
        self.w3 = contract_utility.w3

    def set_oracle_address(self):
        contract_addr = self.contract.functions.oracle().call()
        if  contract_addr != self.w3.eth.default_account:
            print(f"Contract oracle {contract_addr} does not match our address {self.w3.eth.default_account}, updating...",)
            tx_params = self.contract.functions.setOracle(self.w3.eth.default_account).build_transaction({'gasPrice': self.w3.eth.gas_price})
            tx_hash = self.rofl_utility.submit_tx(tx_params)
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            print(f"Updated. Transaction hash: {tx_receipt.transactionHash.hex()}")
        else:
            print(f"Contract oracle {contract_addr} matches our address {self.w3.eth.default_account}")

    async def log_loop(self, poll_interval):
        while True:
            logs = self.contract.events.PromptSubmitted().get_logs(fromBlock=self.w3.eth.block_number)
            for log in logs:
                submitter = log.args.sender
                print(f"New prompt submitted by {submitter}")
                prompts = self.retrieve_prompts(submitter)
                print(f"Got prompts from {submitter}")
                answers = self.retrieve_answers(submitter)
                print(f"Got answers from {submitter}")
                if len(answers)>0 and answers[-1].promptId == len(prompts)-1:
                    print(f"Last prompt already answered, skipping")
                    break
                print(f"Asking chat bot")
                answer = self.ask_chat_bot(prompts)
                print(f"Storing chat bot answer for {submitter}")
                self.submit_answer(answer, submitter)
            await asyncio.sleep(poll_interval)

    def run(self) -> None:
        self.set_oracle_address()

        # Subscribe to PromptSubmitted event
        loop = asyncio.get_event_loop()
        try:
            loop.run_until_complete(
                asyncio.gather(self.log_loop(2)))
        finally:
            loop.close()

    def retrieve_prompts(self,
                         address: str) -> list[str]:
        try:
            prompts = self.contract.functions.getPrompts(b'', address).call()
            return prompts
        except Exception as e:
            print(f"Error retrieving prompts: {e}")
            return []

    def retrieve_answers(self,
                         address: str) -> list[str]:
        try:
            answers = self.contract.functions.getAnswers(b'', address).call()
            return answers
        except Exception as e:
            print(f"Error retrieving answers: {e}")
            return []


    def ask_chat_bot(self, prompts: list[str]) -> str:
        try:
            messages = []
            for prompt in prompts:
                messages.append({
                    'role': 'user',
                    'content': prompt
                })
            client = Client(
                host='http://localhost:11434',
            )
            response: ChatResponse = client.chat(model='deepseek-r1:1.5b', messages=messages)
            return response['message']['content']
        except Exception as e:
            print(f"Error calling Ollama API: {e}")
            return "Error generating response"

    def submit_answer(self, answer: str, address: str):
        # Set a message
        tx_hash = self.contract.functions.submitAnswer(answer, address).transact({'gasPrice': self.w3.eth.gas_price, 'gas': max(3000000, 1500*len(answer))})
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"Submitted answer. Transaction hash: {tx_receipt.transactionHash.hex()}")
