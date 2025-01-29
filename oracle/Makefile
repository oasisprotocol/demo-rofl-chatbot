# Define the Python interpreter
PYTHON=python3

# Install dependencies
install:
	$(PYTHON) -m pip install -r requirements.txt

# Run tests
test:
	$(PYTHON) -m unittest discover -s tests

# Clean up build artifacts
clean:
	rm -rf __pycache__
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info

# Lint code
lint:
	flake8 src/

# Run all checks (linting, testing)
check: lint test

# Create a distribution package
dist:
	$(PYTHON) setup.py sdist bdist_wheel

# Run the application
run:
	$(PYTHON) src/main.py

run-localnet:
	@printf "$(CYAN)*** Starting $(BLUE)sapphire-localnet$(CYAN)...$(OFF)\n"
	@-docker run -it -p8545:8545 -p8546:8546 $(DOCKER_PLATFORM) ghcr.io/oasisprotocol/sapphire-localnet -test-mnemonic

run-localnet-debug:
	@printf "$(CYAN)*** Starting $(BLUE)sapphire-localnet$(CYAN) in $(MAGENTA)DEBUG$(CYAN) mode...$(OFF)\n"
	@-docker run -it -p8545:8545 -p8546:8546 $(DOCKER_PLATFORM) -e OASIS_NODE_LOG_LEVEL=debug -e LOG__LEVEL=debug ghcr.io/oasisprotocol/sapphire-localnet -test-mnemonic