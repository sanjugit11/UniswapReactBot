// import logo from './logo.svg';
import React, { useState,useEffect, useRef } from 'react';
import './App.css';
import Web3 from 'web3';
import * as Tx from 'ethereumjs-tx';
import Binance from 'binance-api-node';
import { PRIVATE_KEY } from './assets/constant';
import routerabi from './assets/RouterAbi.json';
import { CLOSING } from 'ws';


const App = () => {
  const [data, setData] = useState(0);
  const [disable, setDisable] = useState(false);
  let myInterval = useRef();

  let compare = async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider('https://data-seed-prebsc-1-s1.binance.org:8545/'));
    //details
    const routerContract = '0x0e85cA106FD68EC23755023B1415D496159477B2';
    const user = '0xC39192Cc62eDc7668bD5c2280277caEbdc7c48E4'; 
    //binance price from market
    const client = Binance();
    const tokenRes = await client.prices();
    const BNBRes = tokenRes.BNBUSDT;
    const BNBAuto = parseFloat(BNBRes).toFixed(0);
    console.log(BNBAuto,"BNBAuto");
    //binance price from  the pool
    const uni_contract = new web3.eth.Contract(routerabi, routerContract, { from: user, },);
    let etherCal = await web3.utils.toBN(10000000000000000, 'wei');
    const getAmountOut = await uni_contract.methods.getAmountsOut(etherCal, ["0x262afAaDa39435a617A3049Db2BF3e999190eE6E", "0x81FA727E73778f0d8106C10be8d0311E612A99cE"]).call(); //WETH,token
    
    const poolPrice = parseFloat(getAmountOut[1]);
    const poolPriceFixed = (poolPrice / 10000000000000000).toFixed(0);
    console.log(poolPriceFixed, 'poolPriceFixed');
    console.log(data,"setDatasetDatasetData");
    //3% from the pool price
    const HoldPercent = (BNBAuto * data / 100).toFixed(0);
    console.log(HoldPercent,"HoldPercent");
    //differnce real price 3% - pool price
    const comapreMarketPriceLow = Number(BNBAuto) - Number(HoldPercent);
    console.log(comapreMarketPriceLow, "market price 3% less");
    const comapreMarketPriceHigh = Number(BNBAuto) + Number(HoldPercent);
    console.log(comapreMarketPriceHigh, "market price 3% High");

    // const utcTimestamp = new Date().getTime();
    // console.log(utcTimestamp);
    //Array of Path
    const Array = ["0x262afAaDa39435a617A3049Db2BF3e999190eE6E", "0x81FA727E73778f0d8106C10be8d0311E612A99cE"];
    const Array1 = ["0x81FA727E73778f0d8106C10be8d0311E612A99cE", "0x262afAaDa39435a617A3049Db2BF3e999190eE6E"];

    const count = await web3.eth.getTransactionCount(user);
    //private key
    let privateKey = Buffer.from(
      PRIVATE_KEY,
      "hex",
    );

    let etherCall = await web3.utils.toBN(10000000000000000, 'wei');// 2.5 
    const getAmountOut1 = await uni_contract.methods.getAmountsOut(etherCall, ["0x262afAaDa39435a617A3049Db2BF3e999190eE6E", "0x81FA727E73778f0d8106C10be8d0311E612A99cE"]).call();
    console.log(getAmountOut1, "getamountout");

    if (poolPriceFixed < comapreMarketPriceLow) {
      const PriceDifferance = BNBAuto - poolPriceFixed;
      console.log(PriceDifferance, "tokenCalForPriceDiff");

      const decimalOfTokenCal = PriceDifferance * 10 ** 18;
      let tokenCall = await web3.utils.toBN(decimalOfTokenCal, 'wei');       //web3.utils.toWei(web3.utils.toBN(1000,'wei'));
      console.log(tokenCall, "tokenCall");
      
      let minBNB = await web3.utils.toBN(10000000000000, 'wei');
      console.log(minBNB, "minBNB");

      let rawTransaction = {
        from: user,
        gasPrice: web3.utils.toHex(20 * 1e9),
        gasLimit: web3.utils.toHex(250000),
        to: routerContract,
        value: 0x0,
        data: uni_contract.methods.swapExactTokensForETH(tokenCall, minBNB, Array1, user, 1664018496).encodeABI(),
        nonce: web3.utils.toHex(count),
      };
      console.log(minBNB, "rawTransaction");

      let transaction = await new Tx(rawTransaction);
      console.log(minBNB, "transaction");

      transaction.sign(privateKey);
      const trans = await web3.eth.sendSignedTransaction(
        "0x" + transaction.serialize().toString("hex"),
      );
      console.log(trans);

      let etherCall = await web3.utils.toBN(10000000000000000, 'wei');// 2.5 
      const getAmountOut = await uni_contract.methods.getAmountsOut(etherCall, ["0x262afAaDa39435a617A3049Db2BF3e999190eE6E", "0x81FA727E73778f0d8106C10be8d0311E612A99cE"]).call();
      console.log(getAmountOut, "getamountout");

    } else if (poolPriceFixed > comapreMarketPriceHigh) {      //swapExactETHForTokens
      const PriceDifferance = poolPriceFixed - BNBAuto;
      console.log(PriceDifferance, "tokenCalForPriceDiff2");
      // const decimalOfTokenCal = PriceDifferance*10**18;

      const perUsdtBNB = (1 / BNBAuto).toFixed(4);
      console.log(perUsdtBNB, "perUsdtBNB");
      const BNBcalForDifferance = (perUsdtBNB * PriceDifferance).toFixed(4);
      console.log(BNBcalForDifferance, "BNBcalForDifferance");
      const BNBCalDiffWithDecimal = BNBcalForDifferance * 10 ** 18;
      console.log(BNBCalDiffWithDecimal, "BNBCalDiffWithDecimal");

      let tokenCalculation = await web3.utils.toBN(2000000000000000000, 'wei');// 2.5       //web3.utils.toWei(web3.utils.toBN(1000,'wei'));
      let BNBCal = await web3.utils.toBN(BNBCalDiffWithDecimal, 'wei'); //0.01        //web3.utils.toWei(web3.utils.toBN(100000000000000000,'wei'));
      
      let rawTransaction = {
        from: user,
        gasPrice: web3.utils.toHex(20 * 1e9),
        gasLimit: web3.utils.toHex(250000),
        to: routerContract,
        value: BNBCal,
        data: uni_contract.methods.swapExactETHForTokens(tokenCalculation, Array, user, 1664018496).encodeABI(),
        nonce: web3.utils.toHex(count),
      };
      let transaction = new Tx(rawTransaction);
      console.log(transaction, "rawTransaction happen on the line .....");
      transaction.sign(privateKey);
      console.log("jfskflkf");
      const trans = await web3.eth.sendSignedTransaction(
        "0x" + transaction.serialize().toString("hex"),
      );
      // console.log(trans);

      let etherCall = await web3.utils.toBN(10000000000000000, 'wei');// 2.5 
      const getAmountOut = await uni_contract.methods.getAmountsOut(etherCall, ["0x262afAaDa39435a617A3049Db2BF3e999190eE6E", "0x81FA727E73778f0d8106C10be8d0311E612A99cE"]).call();
      console.log(getAmountOut, "getamountout");
    }
    else {
      return
    }
  }
  // useEffect(() => {
  //   compare()
  //   //Runs only on the first render
  // }, []);
  const onChange = (event) => {
    setData(event.target.value)
  }

  const handleEnable = async () => {
    if(myInterval.current){
      handleDisable();
    }
   myInterval.current = setInterval(compare, 50000);
    setDisable(true)
  }


  const handleDisable =()=>{
    console.log(myInterval.current,"myInterval");
    clearInterval(myInterval.current);
    console.log(myInterval.current,"after");
    
  }

  return (
    <div className="App">
      <header className="App-header">

        <input type="number"
          placeholder='Enter percent'
          value={data}
          onChange={(e) => onChange(e)}
          min="0" style={{width: "150px", height: "30px", marginBottom: "10px",
          padding: "10px",
          fontSize: "15px"}}
        />

      
          <button
            onClick={() => !disable?handleEnable():(handleDisable(),setDisable(false))}
            style={{ backgroundColor: "lightblue", fontSize: 26, minWidth: 70, padding: 20 ,borderRadius:8}}
          >
            {!disable ?"Enable":"Disable"}
          </button>
      </header>
    </div>
  );
}

export default App;

