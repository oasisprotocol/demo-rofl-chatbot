// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Subcall} from "@oasisprotocol/sapphire-contracts/contracts/Subcall.sol";
import {SiweAuth} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";

contract ChatBot is SiweAuth {
    mapping(address => string[]) private _prompts;
    mapping(address => string[]) private _answers;

    address private _oracle; // Oracle address running inside TEE.
    bytes21 _roflAppID;      // Allowed app ID within TEE for managing allowed oracle address.

    event promptSubmitted(address sender);
    event answerSubmitted(address sender);

    // Sets up a chat bot smart contract where.
    // @param domain is used for SIWE login on the frontend
    // @param roflAppId is the attested ROFL app that is allowed to call setOracle() afterwards
    // @param oracle only for testing, not attested, sets the oracle address for tests
    constructor(string memory domain, bytes21 roflAppID, address oracle) SiweAuth(domain) {
        _roflAppID = roflAppID;
        _oracle = oracle;
    }

    // For the user: checks whether authToken is a valid SIWE token
    // corresponding to the requested address.
    // For the oracle: checks whether the transaction or query was signed by the
    // oracle's private key accessible only within TEE.
    modifier isAllowedPrompt(bytes memory authToken, address addr) {
        if (msg.sender != addr && msg.sender != _oracle) {
            address msgSender = authMsgSender(authToken);
            if (msgSender != addr && msgSender != _oracle) {
                revert("prompt fetch not allowed");
            }
        }
        _;
    }

    // Append the new prompt and request answer.
    // Called by the user.
    function appendPrompt(string memory prompt) external {
        _prompts[msg.sender].push(prompt);
        emit promptSubmitted(msg.sender);
    }

    // Clears the conversation.
    // Called by the user.
    function clearPrompt() external {
        delete _prompts[msg.sender];
        delete _answers[msg.sender];
    }

    // Returns all prompts for a given user address.
    // Called by the user in the frontend and by the oracle to generate the answer.
    function getPrompts(bytes memory authToken, address addr) isAllowedPrompt(authToken, addr) external returns (string[] memory) {
        return _prompts[addr];
    }

    // Returns all answers for a given user address.
    // Called by the user.
    function getAnswers(bytes memory authToken, address addr) isAllowedPrompt(authToken, addr) external returns (string[] memory) {
        return _answers[addr];
    }

    // Sets the oracle address that will be allowed to read prompts and submit answers.
    // This setter can only be called within the ROFL TEE and the keypair
    // corresponding to the address should never leave TEE.
    function setOracle(address addr) external {
        Subcall.roflEnsureAuthorizedOrigin(roflAppID);
        _oracle = addr;
    }

    // Submits the answer to the prompt for a given user address.
    // Called by the oracle within TEE.
    function submitAnswer(string memory answer, address addr) isAllowedPrompt("", address(0)) external {
        _answers[addr].push(answer);
        emit answerSubmitted(addr);
    }
}