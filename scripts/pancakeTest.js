const { ethers } = require('ethers');
require("dotenv").config();

/* ABI */
const factoryV3Artifact     = require("../misc/PancakeV3Factory.json");
const smartRouterAbi        = require('../misc/pancakeSmartRouterTest.json');
const v3PoolArtifact        = require("../misc/pancakePool.json");
const wBNBArtifact          = require('../misc/WBNB.json');
const erc20Artifact         = require('../misc/ERC20.json');

/*  Parameters */   
const parameters = process.argv.slice(2);
console.log("********* PARAMETERS *********");
console.log("Token      :", parameters[0]);
console.log("Key        :", parameters[1]);
console.log("Buy Value  :", parameters[2]);
console.log("No of Buy  :", parameters[3]);
console.log("******************************");
const token1        = parameters[0];    // token
const key           = parameters[1];    // private key
const BNBValue      = parameters[2];    // buy value in BNB
const noOfBuy_TN    = parameters[3];    // no of buy

/* Testnet Details */
const poolAddresses_TN              = [];
const smartRouterAddress_TN         = '0x9a489505a00cE272eAa5e07Dba6491314CaE3796';
const factoryAddress_TN             = '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865';
const wbnbAddress_TN                = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';
const zeroAddress_TN                = "0x0000000000000000000000000000000000000000";
const provider_TN       = new ethers.providers.JsonRpcProvider(process.env.BNB_TESTNET);
const wallet_TN         = new ethers.Wallet(key);
const signer_TN         = wallet_TN.connect(provider_TN);
const wbnbContract      = new ethers.Contract(wbnbAddress_TN, wBNBArtifact.abi, provider_TN);
const token1Contract    = new ethers.Contract(token1, erc20Artifact.abi, provider_TN);
const FactoryV3_TN      = new ethers.Contract(factoryAddress_TN, factoryV3Artifact.abi, provider_TN);



const mintWBNB = async () => {
    await signer_TN.sendTransaction({
        to: wbnbAddress_TN,
        value: ethers.utils.parseUnits(BNBValue, '18')
    })
}

const buyToken = async (_fee) => {
    let wbnbBalance;
    let token1Balance;

    const amountIn = ethers.utils.parseUnits(BNBValue, '18');
    await wbnbContract.connect(signer_TN).approve(smartRouterAddress_TN, amountIn.toString());
    console.log('Approved!');

    await mintWBNB();
    console.log('Minted!');

    wbnbBalance = await wbnbContract.balanceOf(signer_TN.address);
    token1Balance = await token1Contract.balanceOf(signer_TN.address);
    console.log('================= AFTER MINTING =================');
    console.log('wbnbBalance:', ethers.utils.formatUnits(wbnbBalance.toString(), 18))
    console.log('token1Balance:', ethers.utils.formatUnits(token1Balance.toString(), await token1Contract.decimals()));
    console.log('=================');

    const smartRouterContract = new ethers.Contract(smartRouterAddress_TN, smartRouterAbi.abi, provider_TN);

    const params = {
        tokenIn: wbnbAddress_TN,
        tokenOut: token1,
        fee: _fee,
        recipient: signer_TN.address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 10,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    }

    const tx = await smartRouterContract.connect(signer_TN).exactInputSingle(
        params,
        {
            gasLimit: ethers.utils.hexlify(1000000)
        }
    );
    await tx.wait();

    wbnbBalance = await wbnbContract.balanceOf(signer_TN.address)
    token1Balance = await token1Contract.balanceOf(signer_TN.address)
    console.log('================= AFTER SWAP =================');
    console.log('wbnbBalance:', ethers.utils.formatUnits(wbnbBalance.toString(), 18));
    console.log('token1Balance:', ethers.utils.formatUnits(token1Balance.toString(), await token1Contract.decimals()));
    console.log('=================');
}


async function main() {
    const poolAddressTick_100 = await FactoryV3_TN.getPool(wbnbAddress_TN, token1, 100);
    if (poolAddressTick_100 != zeroAddress_TN) {
        poolAddresses_TN.push(poolAddressTick_100);
    }

    const poolAddressTick_500 = await FactoryV3_TN.getPool(wbnbAddress_TN, token1, 500);
    if (poolAddressTick_500 != zeroAddress_TN) {
        poolAddresses_TN.push(poolAddressTick_500);
    }

    const poolAddressTick_2500 = await FactoryV3_TN.getPool(wbnbAddress_TN, token1, 2500);
    if (poolAddressTick_2500 != zeroAddress_TN) {
        poolAddresses_TN.push(poolAddressTick_2500);
    }

    const poolAddressTick_10000 = await FactoryV3_TN.getPool(wbnbAddress_TN, token1, 10000);
    if (poolAddressTick_10000 != zeroAddress_TN) {
        poolAddresses_TN.push(poolAddressTick_10000);
    }

    let counter = 0;
    poolAddresses_TN.map(async address => {
        const pool = new ethers.Contract(address, v3PoolArtifact.abi, provider_TN)
        pool.on('Mint', async (sender, owner, tickLower, tickUpper, amount, _amount0, _amount1) => {
            counter++;
            console.log(
                'Mint', '|',
                'Address', address, '|',
                'amount:', amount, '|',
                'sender', sender, '|',
                'owner', owner, '|',
            )
            const poolContract = new ethers.Contract(pool.address, v3PoolArtifact.abi, provider_TN);
            await buyToken(await poolContract.fee());
            console.log("*********");
            if (counter >= noOfBuy_TN) {
                process.exit();
            }
        })
    })
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

