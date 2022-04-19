var maticMainnetID = 80001;
var requestChainID = "0x89";

async function decrease(){
  var numberBox = document.getElementById("mintAmount");
  var buttonDecrease = document.getElementsByClassName("minus");
  var buttonIncrease = document.getElementsByClassName("plus");
  
  if(numberBox.value > 1){
    numberBox.value = parseInt(numberBox.value) - 1;
    
    if(numberBox.value == 1){
      buttonDecrease[0].disabled = true;
    }
    
    if(buttonIncrease[0].disabled){
      buttonIncrease[0].disabled = false;
    }
  }
}

async function increase(){
  var numberBox = document.getElementById("mintAmount");
  var buttonDecrease = document.getElementsByClassName("minus");
  var buttonIncrease = document.getElementsByClassName("plus");
  
  if(numberBox.value < 10){
    numberBox.value = parseInt(numberBox.value) + 1;
    
    if(numberBox.value == 10){
      buttonIncrease[0].disabled = true;
    }
    
    if(buttonDecrease[0].disabled){
      buttonDecrease[0].disabled = false;
    }
  }
}

function displayMintedAmount(){
  var amount;
  var paragraph = document.getElementById('mintedAmount');
  
  async function cycle(){
    amount = await window.mintContract.methods.minted().call();
   
    if(amount > 5200){
      amount = 5200;
    }
    paragraph.innerHTML = amount + '/5200';
    
    setTimeout(cycle, 1000);
  }

  cycle();
}

async function mintWithMana(){
  const accounts = await getAccounts();
  
  if(accounts.length > 0){
    web3.eth.net.getId().then(async function(networkId) {
      if (networkId != maticMainnetID) {
        alert("Switch to Matic Mainnet.");
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: requestChainID }],
        });
      }
      else{
        var numberBox = document.getElementById("mintAmount");
        var json = await getContractsJSON();

        var price = await window.mintContract.methods.manaPrice(numberBox.value).call();
        price = price.toLocaleString('fullwide', {useGrouping:false});

        await window.manaContract.methods.approve(json.mintContractAddress, price).send({ from: accounts[0] });
        await window.mintContract.methods.buyWithMana(numberBox.value).send({ from: accounts[0] });
      }
    });
  }
  else{
    alert("No metamask detected.");
  }
}

async function mintWithEthereum(){
  const accounts = await getAccounts();
  
  if(accounts.length > 0){
    web3.eth.net.getId().then(async function(networkId) {
        if (networkId != maticMainnetID) {
          alert("Switch to Matic Mainnet.");
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: requestChainID }],
          });
        }
        else{
          var numberBox = document.getElementById("mintAmount");
          var json = await getContractsJSON();

          await window.mintContract.methods.publicSale(numberBox.value).send({ from: accounts[0] });
        }
    });
  }
  else{
    alert("No metamask detected.");
  }
}

async function approve(){
  const accounts = await getAccounts();
  
  if(accounts.length > 0){
    web3.eth.net.getId().then(async function(networkId) {
        if (networkId != maticMainnetID) {
          alert("Switch to Matic Mainnet.");
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: requestChainID }],
          });
        }
        else{
          var numberBox = document.getElementById("mintAmount");
          var json = await getContractsJSON();
          
          var price = await window.mintContract.methods.mintEthCost().call();
          price = price * numberBox.value;
          price = price.toLocaleString('fullwide', {useGrouping:false});

          await window.wethContract.methods.approve(json.mintContractAddress, price).send({ from: accounts[0] });      
        }
    });
  }
  else{
    alert("No metamask detected.");
  }
}

async function getContractsJSON() {
  const response = await fetch("./ElfGame Staking Page/contract_info/contracts.json");
  const json = await response.json();
  return json;
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

function isMobileDevice() {
    return 'ontouchstart' in window || 'onmsgesturechange' in window;
}

async function connectWalletMobile() {
    if (isMobileDevice()) {
      if(window.ethereum){
        displayWallet();
      }
      else {
        const metamaskAppDeepLink = "https://metamask.app.link/dapp/elfgame.app/index.html";
        window.location.href = metamaskAppDeepLink;
      }
    }
}

async function connectWalletDesktop() {
    await ethereum.request({ method: 'eth_requestAccounts' });
    displayWallet();
}

async function goToStakingPage() {
    if(window.ethereum){
        var accounts = await getAccounts();
        if(accounts.length > 0){
            web3.eth.net.getId().then(async function(networkId) {
                if (networkId != maticMainnetID) {
                    alert("Switch to Matic Mainnet first.");
                    await ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: requestChainID }],
                    });
                }else{
                    window.location.href = "../ElfGame Staking Page/index.html";
                }
            });
        }
        else{
            alert("Can't access staking page. No metamask detected.");
        }
    }
}

async function getAccounts(){
    return await ethereum.request({ method: 'eth_accounts' });
}

async function updateAccounts(newText) {
    const walletHeader = document.getElementById('walletHeader');
    walletHeader.innerHTML = newText;
}

async function checkNetwork() {
  var accounts = await getAccounts();
  
  if(accounts.length > 0){
    web3.eth.net.getId().then(async function(networkId) {
      if (networkId != maticMainnetID) {
        alert("Switch to Matic Mainnet.");
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: requestChainID }],
        });
      }
    });
  }
  else{
    alert("No metamask detected.");
  }
}

async function displayWallet() {
  const connectWalletButton = document.getElementById('connect');
  const mintDiv = document.getElementsByClassName('mintDiv');
  
  if(window.ethereum){
    window.web3 = new Web3(window.ethereum);
    checkNetwork();
    var accounts = await getAccounts();
    //var numberBox = document.getElementById("mintAmount");

    if(accounts.length>0){
        connectWalletButton.style.visibility = "hidden";

        updateAccounts("Your address  : " + accounts[0]);
        
        window.mintContract = await loadMintingContract();
        window.manaContract = await loadManaContract();
        window.wethContract = await loadWethContract();
        
        //mintDiv[0].style.visibility = "visible";
      
        //displayMintedAmount();
    }
    else{
        updateAccounts("");
        //mintDiv[0].style.visibility = "hidden";
        connectWalletButton.style.visibility = "visible";
    }
  }
  else{
      //mintDiv[0].style.visibility = "hidden";
      connectWalletButton.style.visibility = "visible";
  }
}

async function checkIfWalletIsConnected() {
    if(window.ethereum){
        connectWalletDesktop();
    } 
    else{
        connectWalletMobile();
    }
}

displayWallet();
