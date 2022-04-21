// Global ariables

var json;

// Moralis info
const serverUrl = "https://xiyygzf4lnms.usemoralis.com:2053/server";
const appId = "Cz4mSGYi6GQR6l16MLlzFC4OVvPM5vrfVPaV7zVJ";

const chainName = "mumbai";

// Metamask network

const maticMainnetId = 80001;

async function checkNetwork() {
    web3.eth.net.getId().then((networkId) => {
      if (networkId != maticMainnetId) {
        alert("Connect to Matic Mainnet first.");
        window.location.href = "../index.html";
      }
    })
    .catch((err) => {
      alert("Unable to retrieve netwok information.");
      window.location.href = "../index.html";
    });
}

// Loading contracts
async function getContractsJSON() {
    const response = await fetch("./contract_info/contracts.json");
    const json = await response.json();
    return json;
}

async function loadStakingContract() {
    return await new window.web3.eth.Contract(json.stakeContractABI, json.stakeContractAddress);
}
  
async function loadMintingContract() {
    return await new web3.eth.Contract(json.mintContractABI, json.mintContractAddress);
}
  
async function loadManaContract() {
    return await new web3.eth.Contract(json.manaContractABI, json.manaContractAddress);
}
  
async function loadWethContract() {
    return await new web3.eth.Contract(json.wethContractABI, json.wethContractAddress);
}

async function loadContracts() {
    window.mintContract = await loadMintingContract();
    window.stakeContract = await loadStakingContract();
    window.manaContract = await loadManaContract();
    window.wethContract = await loadWethContract();
}

// Load NFT's

async function loadNFT() {
    const options = {
        chain: chainName,
        token_address: json.mintContractABI
      };

    const NFTs = await Moralis.Web3API.account.getNFTsForContract(options);

    console.log(NFTs.result);
}

// Load Web3 and Moralis

async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        Moralis.start({ serverUrl, appId });
        await Moralis.enableWeb3();
    }
    else{
      window.location.href = "../index.html";
    }
}

// Load site

async function load() {
    await loadWeb3();

    checkNetwork();

    await loadContracts();

    loadNFT();

}

// Function calls and variable initialization

json = await getContractsJSON();

load();