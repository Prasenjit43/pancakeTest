## PancakeTest Repository Setup and Execution Guide

This guide provides instructions for setting up and executing the PancakeTest script from the PancakeTest repository.

### Step 1: Clone the Repository

Clone the repository using the following command:

```shell
git clone https://github.com/Prasenjit43/pancakeTest.git
```

### Step 2: Navigate to the Project Directory

Navigate to the project directory using the command:

```shell
cd pancakeTest
```

### Step 3: Install Required npm Packages

Install the required npm packages using the command:

```shell
npm install
```

### Step 4: Replace "BNB_TESTNET" Provider

Open the `.env` file and replace the value of the "BNB_TESTNET" provider with the appropriate provider URL.

### Step 5: Execute the Script

Run the following command to execute the PancakeTest script:

```shell
node scripts/pancakeTest.js <token1> <privateKey> <bnbValue> <numberOfBuy>
```

Replace the placeholders `<token1>`, `<privateKey>`, `<bnbValue>`, and `<numberOfBuy>` with the actual values you intend to use. Here's an example command:

```shell
node scripts/pancakeTest.js 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 0.001 2
```

### Notes

- `<token1>`: The token address.
- `<privateKey>`: Your private key.
- `<bnbValue>`: The value of BNB (Binance Coin) to use for transactions.
- `<numberOfBuy>`: The number of buy operations to perform.

---


---
