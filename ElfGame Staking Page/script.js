var maticMainnetId = 80001;

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

async function updateAccounts(address) {
    const wallet = document.getElementById('walletAddress');
    wallet.innerHTML = "Your address  : " + address;
  }

async function getContractsJSON() {
    const response = await fetch("./contract_info/contracts.json");
    const json = await response.json();
    return json;
}

async function connect() {
    const accounts = await getAccounts();
  
    if(accounts.length>0){
      updateAccounts(accounts[0]);
    }
    else{
      window.location.href = "../index.html";
    }
  }

async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
  
        connect()
    }
    else{
      window.location.href = "../index.html";
    }
  }

async function getAccounts(){
    return await ethereum.request({ method: 'eth_accounts' });
}

// Getting contracts

async function loadStakingContract() {
    var json = await getContractsJSON();
    return await new window.web3.eth.Contract(json.stakeContractABI, json.stakeContractAddress);
  }
  
  async function loadMintingContract() {
    var json = await getContractsJSON();
    return await new web3.eth.Contract(json.mintContractABI, json.mintContractAddress);
  }
  
  async function loadManaContract() {
    var json = await getContractsJSON();
    return await new web3.eth.Contract(json.manaContractABI, json.manaContractAddress);
  }
  
  async function loadWethContract() {
    var json = await getContractsJSON();
    return await new web3.eth.Contract(json.wethContractABI, json.wethContractAddress);
  }

// Loading NFT's

async function loadNFT() {
    const json = await getContractsJSON();
    const ownerAddress = await getAccounts();
    const options = {method: 'GET', headers: {Accept: 'application/json'}};

    console.log(ownerAddress);

    fetch(`https://api.opensea.io/api/v1/assets?owner=${ownerAddress}`, options).then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
}

// Loading contracts

async function load(){
    loadWeb3();
    checkNetwork();
    
    window.mintContract = await loadMintingContract();
    window.stakeContract = await loadStakingContract();
    window.manaContract = await loadManaContract();
    window.wethContract = await loadWethContract();
  
  }
  
  // Onclick functions
  
  async function decrease(){
    var numberBox = document.getElementById("inputMintAmount");
    var buttonDecrease = document.getElementsByClassName("minus");
    var buttonIncrease = document.getElementsByClassName("plus");
    
    if(numberBox.value > 1){
      numberBox.value = parseInt(numberBox.value) - 1;
      
      updatePrice();
      
      if(numberBox.value == 1){
        buttonDecrease[0].disabled = true;
      }
      
      if(buttonIncrease[0].disabled){
        buttonIncrease[0].disabled = false;
      }
    }
  }
  
  async function increase(){
    var numberBox = document.getElementById("inputMintAmount");
    var buttonDecrease = document.getElementsByClassName("minus");
    var buttonIncrease = document.getElementsByClassName("plus");
    
    if(numberBox.value < 10){
      numberBox.value = parseInt(numberBox.value) + 1;
      
      updatePrice();
      
      if(numberBox.value == 10){
        buttonIncrease[0].disabled = true;
      }
      
      if(buttonDecrease[0].disabled){
        buttonDecrease[0].disabled = false;
      }
    }
  }
  
  async function mintWithEthereum(){
    var numberBox = document.getElementById("inputMintAmount");
    var json = await getContractsJSON();
    const accounts = await getAccounts();
  
    var price = await window.mintContract.methods.minthEthCost().call();
    price = price * numberBox.value;
    price = price.toLocaleString('fullwide', {useGrouping:false});
  
    await window.wethContract.methods.approve(json.mintContractAddress, price).send({ from: accounts[0] });
    await window.mintContract.methods.publicSale(numberBox.value).send({ from: accounts[0] });
  }
  
  async function mintWithMana(){
    var numberBox = document.getElementById("inputMintAmount");
    var json = await getContractsJSON();
    const accounts = await getAccounts();
  
    var price = await window.mintContract.methods.manaPrice(numberBox.value).call();
    price = price * numberBox.value;
    price = price.toLocaleString('fullwide', {useGrouping:false});
  
    await window.manaContract.methods.approve(json.mintContractAddress, price).send({ from: accounts[0] });
    await window.mintContract.methods.buyWithMana(numberBox.value).send({ from: accounts[0] });
  }
  
  async function ambush() {
    var arrayChecked = new Array();
    var json = getContractsJSON();
    
    stakedOrcsArray.forEach(function(id){
      var nft = document.getElementById("nft" + id);
      
      if (nft.className == 'selectedStaked') {
        arrayChecked.push(id);
    }
    });
  
    if(arrayChecked.length == 1){
      const accounts = await getAccounts();
  
      var cost = await window.stakeContract.methods.ambushCost(arrayChecked[0]).call();
      cost = web3.utils.toBN(cost);
      await window.stakeContract.methods.startAmbush(arrayChecked[0]).send({ from: accounts[0], value: cost });
  
      loadTokens();
    }
    else{
      alert("Select only one staked orc for ambush.");
    }
  }
  
  async function stakeElfs(){
    var arrayChecked = new Array();
    
    unstakedElfsArray.forEach(function(id){
      var nft = document.getElementById("nft" + id);
      
      if (nft.className == 'selectedUnstaked') {
        arrayChecked.push(id);
    }
    });
  
    if(arrayChecked.length > 0){
      const accounts = await getAccounts();
      var json = await getContractsJSON();
      
      var approved = await window.mintContract.methods.isApprovedForAll(accounts[0], json.stakeContractAddress).call();
      if(approved){
        await window.stakeContract.methods.batchStakeElf(arrayChecked).send({ from: accounts[0] });
  
        loadTokens();
        updateTotalStakedElfs();
      }
      else{
        await window.mintContract.methods.setApprovalForAll(json.stakeContractAddress, true).send({ from: accounts[0] });
        await window.stakeContract.methods.batchStakeElf(arrayChecked).send({ from: accounts[0] });
  
        loadTokens();
        updateTotalStakedElfs();
      }
    }
    else{
      alert("Select a unstaked elf.");
    }
  }
  
  async function stakeOrcs(){
    var arrayChecked = new Array();
    
    unstakedOrcsArray.forEach(function(id){
      var nft = document.getElementById("nft" + id);
      
      if (nft.className == 'selectedUnstaked') {
        arrayChecked.push(id);
    }
    });
  
    if(arrayChecked.length > 0){
      const accounts = await getAccounts();
      var json = await getContractsJSON();
      
      var approved = await window.mintContract.methods.isApprovedForAll(accounts[0],json.stakeContractAddress).call();
      if(approved){
        await window.stakeContract.methods.batchStakeOrc(arrayChecked).send({ from: accounts[0] });
  
        loadTokens();
      }
      else{
        await window.mintContract.methods.setApprovalForAll(json.stakeContractAddress, true).send({ from: accounts[0] });
        await window.stakeContract.methods.batchStakeOrc(arrayChecked).send({ from: accounts[0] });
  
        loadTokens();
      }
    }
    else{
      alert("Select a unstaked orc.");
    }
  }
  
  async function unstakeElfs(){
    var arrayChecked = new Array();
    
    stakedElfsArray.forEach(function(id){
      var nft = document.getElementById("nft" + id);
      
      if (nft.className == 'selectedStaked') {
        arrayChecked.push(id);
    }
    });
  
    if(arrayChecked.length>0){
      const accounts = await getAccounts();
      await window.stakeContract.methods.batchUnstakeElf(arrayChecked).send({ from: accounts[0] });
  
      updateMana();
      loadTokens();
    }
    else{
      alert("Select a staked elf.");
    }
  }
  
  async function unstakeOrcs(){
    var arrayChecked = new Array();
  
    stakedOrcsArray.forEach(function(id){
      var nft = document.getElementById("nft" + id);
      
      if (nft.className == 'selectedStaked') {
        arrayChecked.push(id);
    }
    });
  
    if(arrayChecked.length>0){
      const accounts = await getAccounts();
      await window.stakeContract.methods.claimManyRewards(arrayChecked,true).send({ from: accounts[0] });
  
      updateMana();
      loadTokens();
    }
    else{
      alert("Select a staked orc.");
    }
  }
  
  async function selectAllElfsStake(){
    var button = document.getElementById("selectUnstakedElfs");
    
    if(button.innerHTML == "Select all"){
      unstakedElfsArray.forEach(function(id){
        var nft = document.getElementById("nft" + id);
        nft.className = 'selectedUnstaked';
      });
      button.innerHTML = "Deselect all";
    }
    else if(button.innerHTML == "Deselect all"){
      unstakedElfsArray.forEach(function(id){
        var nft = document.getElementById("nft" + id);
        nft.className = 'nftUnstaked';
      });
      button.innerHTML = "Select all";
    }
  }
  
  async function selectAllOrcsStake(){
    var button = document.getElementById("selectUnstakedOrcs");
    
    if(button.innerHTML == "Select all"){
      unstakedOrcsArray.forEach(function(id){
        var nft = document.getElementById("nft" + id);
        nft.className = 'selectedUnstaked';
      });
      button.innerHTML = "Deselect all";
    }
    else if(button.innerHTML == "Deselect all"){
      unstakedOrcsArray.forEach(function(id){
        var nft = document.getElementById("nft" + id);
        nft.className = 'nftUnstaked';
      });
      button.innerHTML = "Select all";
    }
  }
  
  async function selectAllElfsUnstake(){
    var button = document.getElementById("selectStakedElfs");
    
    if(button.innerHTML == "Select all"){
      stakedElfsArray.forEach(function(id){
        var nft = document.getElementById("nft" + id);
        nft.className = 'selectedStaked';
      });
      button.innerHTML = "Deselect all";
    }
    else if(button.innerHTML == "Deselect all"){
      stakedElfsArray.forEach(function(id){
        var nft = document.getElementById("nft" + id);
        nft.className = 'nftStaked';
      });
      button.innerHTML = "Select all";
    }
  }
  
  async function selectAllOrcsUnstake(){
    var button = document.getElementById("selectStakedOrcs");
    
    if(button.innerHTML == "Select all"){
      stakedOrcsArray.forEach(function(id){
        var nft = document.getElementById("nft" + id);
        nft.className = 'selectedStaked';
      });
      button.innerHTML = "Deselect all";
    }
    else if(button.innerHTML == "Deselect all"){
      stakedOrcsArray.forEach(function(id){
        var nft = document.getElementById("nft" + id);
        nft.className = 'nftStaked';
      });
      button.innerHTML = "Select all";
    }
  }
  
  async function claimElfRewards(){
    var arrayChecked = new Array();
    
    stakedElfsArray.forEach(function(id){
      var nft = document.getElementById("nft" + id);
      
      if (nft.className == 'selectedStaked') {
        arrayChecked.push(id);
    }
    });
  
    if(arrayChecked.length>0){
      const accounts = await getAccounts();
      await window.stakeContract.methods.claimManyRewards(arrayChecked,false).send({ from: accounts[0] });
  
      updateMana();
      loadTokens();
    }
    else{
      alert("Select a staked elf.");
    }
  }
  
  async function claimOrcRewards(){
    var arrayChecked = new Array();
  
    stakedOrcsArray.forEach(function(id){
      var nft = document.getElementById("nft" + id);
      
      if (nft.className == 'selectedStaked') {
        arrayChecked.push(id);
    }
    });
  
    if(arrayChecked.length>0){
      const accounts = await getAccounts();
      await window.stakeContract.methods.claimManyRewards(arrayChecked,false).send({ from: accounts[0] });
  
      updateMana();
      loadTokens();
    }
    else{
      alert("Select a staked orc.");
    }
  }

  load();
  loadNFT();