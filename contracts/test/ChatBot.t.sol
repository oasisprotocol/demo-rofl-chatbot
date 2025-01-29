// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";

contract ChatBotTest is Test {
    ChatBot public chatBot;
    address public user;
    address public _oracle;
    string public domain;

    function setUp() public {
        domain = "example.com";
        _oracle = address(0x123);
        user = address(0x456);
        bytes21 roflAppID = bytes21(0);
        chatBot = new ChatBot(domain, roflAppID, _oracle);
    }

    function test_appendPrompt() public {
        vm.startPrank(user);
        chatBot.appendPrompt("Hello");
        string[] memory prompts = chatBot.getPrompts("", user);
        assertEq(prompts.length, 1);
        assertEq(prompts[0], "Hello");
        vm.stopPrank();
    }

    function test_clearPrompt() public {
        vm.startPrank(user);
        chatBot.appendPrompt("Hello");
        chatBot.clearPrompt();
        string[] memory prompts = chatBot.getPrompts("", user);
        string[] memory answers = chatBot.getAnswers("", user);
        assertEq(prompts.length, 0);
        assertEq(answers.length, 0);
        vm.stopPrank();
    }

    function test_submitAnswer() public {
        vm.startPrank(_oracle);
        chatBot.submitAnswer("Test answer", user);
        string[] memory answers = chatBot.getAnswers("", user);
        assertEq(answers.length, 1);
        assertEq(answers[0], "Test answer");
        vm.stopPrank();
    }

    function test_setOracle() public {
        address newOracle = address(0x789);
        vm.mockCall(
            address(this),
            abi.encodeWithSelector(Subcall.roflEnsureAuthorizedOrigin.selector),
            abi.encode()
        );
        chatBot.setOracle(newOracle);
        // Test that new oracle can submit answers
        vm.startPrank(newOracle);
        chatBot.submitAnswer("New oracle answer", user);
        vm.stopPrank();
    }

    function testFail_unauthorizedPromptAccess() public {
        address unauthorizedUser = address(0x999);
        vm.startPrank(unauthorizedUser);
        chatBot.getPrompts("", user);
        vm.stopPrank();
    }

    function testFail_unauthorizedAnswerSubmission() public {
        address unauthorizedUser = address(0x999);
        vm.startPrank(unauthorizedUser);
        chatBot.submitAnswer("Unauthorized answer", user);
        vm.stopPrank();
    }
}