// Global variables

var json;

var unstakedElfsJSONArray = new Array();
var unstakedOrcsJSONArray = new Array();

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

async function loadUnstakedNFTs() {
    const options = {
        chain: chainName,
        token_address: json.mintContractAddress
    };

    const NFTs = await Moralis.Web3API.account.getNFTsForContract(options);

    console.log(NFTs.result);

    NFTs.result.forEach(NFT => {
        if(JSON.parse(NFT.metadata).name.includes("Elf")){
            unstakedElfsJSONArray.push(NFT);
        }
        else if(JSON.parse(NFT.metadata).name.includes("Orc")){
            unstakedOrcsJSONArray.push(NFT);
        }
    });

    displayUnstaked();
}

// Display NFTs

async function displayUnstaked() {
    displayUnstakedNFTS("Elf");
    displayUnstakedNFTS("Orc");
}

async function displayUnstakedNFTS(type){
    var mainSection = document.getElementsByClassName('Unstaked'+ type +'sMainSection');
    var temporarySection  = document.getElementsByClassName('Unstaked'+ type +'sTemporary');
  
    var buttonStake = document.getElementsByClassName('ButtonStake' + type);
    mainSection[0].removeChild(temporarySection[0]);
  
    var newSection = document.createElement('div');
    newSection.className = 'Unstaked'+ type +'sTemporary';
  
    mainSection[0].appendChild(newSection);
    mainSection[0].appendChild(buttonStake[0]);
  
    if(type == "Orc"){
      await drawNFT(unstakedOrcsJSONArray,newSection,false);
    }
    else if(type == "Elf"){
      await drawNFT(unstakedElfsJSONArray,newSection,false);
    }
}

async function drawNFT(typeArray, section, staked){
    typeArray.forEach(function(NFT_JSON) {
        var id = NFT_JSON.token_id;
        var nft = document.createElement('section');
      
        if(staked){
            nft.className = 'nftStaked';
        }
        else{
            nft.className = 'nftUnstaked';
        }
        
        nft.id = 'nft' + id;
    
        if(staked){
            nft.onclick = function () {
                if(document.getElementById('nft' + id).className == 'selectedStaked'){
                    document.getElementById('nft' + id).className = 'nftStaked';
                }
                else{
                    document.getElementById('nft' + id).className = 'selectedStaked';
                }
            }
        }
        else{
            nft.onclick = function () {
                if(document.getElementById('nft' + id).className == 'selectedUnstaked'){
                    document.getElementById('nft' + id).className = 'nftUnstaked';
                }
                else{
                    document.getElementById('nft' + id).className = 'selectedUnstaked';
                }
            }
        }
    
        var imageHTML = document.createElement('img');
        var img = JSON.parse(NFT_JSON.metadata).image.substring(7);
        imageHTML.src = `https://gateway.moralisipfs.com/ipfs/${img}`;
        imageHTML.id = 'NFTImage';
        
        var tokenIdParagraph = document.createElement('p');
        tokenIdParagraph.id = 'idParagraph';
        tokenIdParagraph.innerHTML = '#' + JSON.parse(NFT_JSON.metadata).name.split('#').pop();
    
        nft.append(imageHTML);
        nft.append(tokenIdParagraph);
    
        if(staked){
            var stakedDate = stakingTimestamp.get(id);
            var currentDate = new Date();
            var newDate = new Date(Math.abs(currentDate-stakedDate));
    
            var rewardAmount = document.createElement('p');
            rewardAmount.id = "rewardTokensAmount"+id;
            rewardAmount.className = "rewardTokensAmountClass";
            rewardAmount.innerHTML = '0';
    
            var timeParagraph = document.createElement('p');
            timeParagraph.className = 'timestampParagraph';
            timeParagraph.id = 'counter' + id;
            timeParagraph.innerHTML = toFormatString(time(newDate));
    
            nft.appendChild(rewardAmount);
            nft.appendChild(timeParagraph);
        }
    
        section.appendChild(nft);
    });
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
    json = await getContractsJSON();

    await loadWeb3();

    checkNetwork();

    await loadContracts();

    loadUnstakedNFTs();

}

// Function calls and variable initialization

load();