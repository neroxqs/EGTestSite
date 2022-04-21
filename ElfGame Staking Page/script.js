// Global variables

var json;
var account;

var allStakedIDs;
var stakedElfsArray;
var stakedOrcsArray;

var stakedElfsJSONArray;
var stakedOrcsJSONArray;
var unstakedElfsJSONArray;
var unstakedOrcsJSONArray;

var stakingTimestamp = new Map();

var stakedElfsInfo = new Map();
var stakedOrcsInfo = new Map();

// String format

function toFormatString(tStruct){
    var res = '';
    if (typeof tStruct === 'object'){
        res += tStruct.d + ':'+ ((tStruct.h<10) ? ('0'+tStruct.h):(tStruct.h)) + ':' + ((tStruct.m<10) ? ('0'+tStruct.m):(tStruct.m)) + ':' + ((tStruct.s<10) ? ('0'+tStruct.s):(tStruct.s));
    }
    return res;
}

function time(ms) {
    var d, h, m, s;
    if (isNaN(ms)) {
        return {};
    }
    d = ms / (1000 * 60 * 60 * 24);
    h = (d - ~~d) * 24;
    m = (h - ~~h) * 60;
    s = (m - ~~m) * 60;
    return {d: ~~d, h: ~~h, m: ~~m, s: ~~s};
}

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

// Metamask account address

async function getAccounts(){
    return await ethereum.request({ method: 'eth_accounts' });
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

// Refresh metadata

async function resfreshMetadata(array) {
    for (let i = 0; i < array.length; i++) {

        await sleep(2000);

        const options2 = {
            chain: chainName,
            address: json.mintContractAddress,
            token_id: ""+array[i],
            flag: "uri"
        };

        await Moralis.Web3API.token.reSyncMetadata(options2);
    }
}

// Load user staked NFT's

async function loadStakedElfs(){
    var id;
    var tokenInfo;
    stakedElfsArray = new Array();
    const lengthElfs = await window.stakeContract.methods.numberOfStakedElfs(account).call();
  
    for (let i = 0; i < lengthElfs; i++) {
      id = await window.stakeContract.methods.elfStakingsByOwner(account,i).call();
      tokenInfo = await window.stakeContract.methods.elfStakings(id).call();
  
      stakedElfsArray.push(id);
      stakingTimestamp.set(id ,new Date(tokenInfo.timestamp*1000));
      stakedElfsInfo.set(id, tokenInfo);
    }
}

async function loadStakedOrcs(){
    var id;
    var tokenInfo;
    stakedOrcsArray = new Array();
    const lengthOrcs = await window.stakeContract.methods.numberOfStakedOrcs(account).call();
  
    for (let i = 0; i < lengthOrcs; i++) {
      id = await window.stakeContract.methods.orcStakingsByOwner(account,i).call();
      tokenInfo = await window.stakeContract.methods.orcStakings(id).call();
      
      stakedOrcsArray.push(id);
      stakingTimestamp.set(id ,new Date(tokenInfo.timestamp*1000));
      stakedOrcsInfo.set(id, tokenInfo);
    }
}

async function loadStakedIDs() {
    await loadStakedElfs();
    await loadStakedOrcs();

    allStakedIDs = stakedElfsArray.concat(stakedOrcsArray);
}

// Load NFT's info

async function loadUnstakedNFTs() {
    var metadataRefreshUnstaked = new Array();
    unstakedElfsJSONArray = new Array();
    unstakedOrcsJSONArray = new Array();

    const options = {
        chain: chainName,
        token_address: json.mintContractAddress
    };

    const NFTs = await Moralis.Web3API.account.getNFTsForContract(options);

    NFTs.result.forEach(NFT => {
        if(JSON.parse(NFT.metadata).name.includes("Elf")){
            unstakedElfsJSONArray.push(NFT);
        }
        else if(JSON.parse(NFT.metadata).name.includes("Orc")){
            unstakedOrcsJSONArray.push(NFT);
        }
        else if(JSON.parse(NFT.metadata) === null){
            metadataRefreshUnstaked.push(NFT.token_id);
        }
    });

    resfreshMetadata(metadataRefreshUnstaked);
    displayUnstaked();
}

async function loadStakedNFTs() {
    await loadStakedIDs();

    var metadataRefreshStaked = new Array();
    var NFT;
    var options;
    stakedElfsJSONArray = new Array();
    stakedOrcsJSONArray = new Array();

    for (let i = 0; i < allStakedIDs.length; i++) {
        options = {
            address: json.mintContractAddress,
            token_id: "" + allStakedIDs[i],
            chain: chainName
        };

        NFT = await Moralis.Web3API.token.getTokenIdMetadata(options);

        if(JSON.parse(NFT.metadata).name.includes("Elf")){
            stakedElfsJSONArray.push(NFT);
        }
        else if(JSON.parse(NFT.metadata).name.includes("Orc")){
            stakedOrcsJSONArray.push(NFT);
        }
        else if(JSON.parse(NFT.metadata) === null){
            metadataRefreshStaked.push(NFT.token_id);
        }
    }

    resfreshMetadata(metadataRefreshStaked);
    displayStaked();
}

async function loadNFTs() {
    await loadUnstakedNFTs();
    await loadStakedNFTs();
}

// Display NFTs

async function displayUnstaked() {
    displayUnstakedNFTS("Elf");
    displayUnstakedNFTS("Orc");
}

async function displayStaked() {
    displayStakedNFTS("Elf");
    displayStakedNFTS("Orc");
}

async function displayStakedNFTS(type){
    var mainSection = document.getElementsByClassName('Staked'+ type +'sMainSection');
    var temporarySection  = document.getElementsByClassName('Staked'+ type +'sTemporary');
  
    var buttonClaim = document.getElementsByClassName('ButtonClaim'+type);
    var buttonUnstake = document.getElementsByClassName('ButtonUnstake'+type);
  
    var newSection = document.createElement('div');
    newSection.className = 'Staked'+ type +'sTemporary';
  
    mainSection[0].removeChild(temporarySection[0]);
    mainSection[0].appendChild(newSection);
    mainSection[0].appendChild(buttonClaim[0]);
    mainSection[0].appendChild(buttonUnstake[0]);
  
    if(type == "Orc"){
      var buttonAmbush = document.getElementsByClassName('ButtonAmbush');
      mainSection[0].appendChild(buttonAmbush[0]);
  
      await drawNFT(stakedOrcsJSONArray,newSection,true);
    }
    else if(type == "Elf"){
      await drawNFT(stakedElfsJSONArray,newSection,true);
    }
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
    console.log(typeArray);
    typeArray.forEach(function(NFT_JSON) {
        var id = NFT_JSON.token_id;
        console.log(id);
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
    // Loading contracts info
    json = await getContractsJSON();

    // Loading Web3 and Moralis
    await loadWeb3();

    // Checking metamask network
    checkNetwork();

    // Get current account
    account = (await getAccounts())[0];

    // Loading contracts
    await loadContracts();

    // Load and display NFTs
    loadNFTs();

}

// Button functions

async function stakeElfs(){
    var arrayChecked = new Array();
    
    unstakedElfsArray.forEach(function(id){
      var nft = document.getElementById("nft" + id);
      
      if (nft.className == 'selectedUnstaked') {
        arrayChecked.push(id);
    }
    });
  
    if(arrayChecked.length > 0){
      var json = await getContractsJSON();
      
      var approved = await window.mintContract.methods.isApprovedForAll(account, json.stakeContractAddress).call();
      if(approved){
        await window.stakeContract.methods.batchStakeElf(arrayChecked).send({ from: account });
  
        loadTokens();
        updateTotalStakedElfs();
      }
      else{
        await window.mintContract.methods.setApprovalForAll(json.stakeContractAddress, true).send({ from: account });
        await window.stakeContract.methods.batchStakeElf(arrayChecked).send({ from: account });
  
        loadTokens();
        updateTotalStakedElfs();
      }
    }
    else{
      alert("Select a unstaked elf.");
    }
}

// Function calls and variable initialization

load();