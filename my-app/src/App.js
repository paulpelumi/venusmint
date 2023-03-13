import React, { useEffect, useState } from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Grid,
  theme,
  Button,
  HStack,
  Input,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  Alert,
  useToast,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import {
  connect,
  isMetaMaskInstalled,
  getProvider,
  getSigner,
} from './connection/metamask';
// import { ethers } from 'ethers';
import { formatEther, Contract, parseEther, } from 'ethers';
import VToken from './abi/vtoken.json';

function App() {
  const [account, setAccount] = useState('');
  const [myBalance, setMyBalance] = useState('');
  const [mintValue, setMintValue] = useState("");
  const [chainError, setChainError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (account) {
      getBalance(account);
      setChainError(null);
    }
    console.log(VToken);
  }, [chainError, account]);

  const checkMetamask = async () => {
    if (isMetaMaskInstalled) {
      if (window.ethereum.chainId === '0x61') {
        const userAccount = await connect();
        console.log(userAccount);
        setAccount(userAccount[0]);
      } else {
        setChainError('change network to Binance Testnet');
        throw new Error('change network to Binance Testnet');
      }
    } else {
      throw new Error('Install metamask');
    }
  };


  const getBalance = async myAccount => {
    const provider = getProvider();
    const balance = await provider.getBalance(myAccount);
    console.log(formatEther(balance));
    setMyBalance(formatEther(balance));
    return balance;
  };

  const VTokenContract = async () => {
    const abi = [
      function mint(){} ,
    ];

    const signer = await getSigner();
    // Create a contract
    const VTokenContract = new Contract(
      '0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c',
      abi,
      signer
    );
    return VTokenContract;
  };

  // const checkEvents = async() => {
  //   let teamleadContract = new ethers.Contract {"0xB0b72FB76a9390943A869eD2e837D183Cd44F954", abi, signer} 

  //   teamleadContract.on  {"LeadSet"}
  // }
  // // const ethers = require("ethers");s
  // // const teamlead = require("")

  
  const mint = async () => {
    let balance = await getBalance(account);
    balance = parseInt(balance) * 10 ** -18;

    if (balance < Number(mintValue)) {
      toast({
        position: "top-right",
        render: () => (
          <Box color="black" p={2} bg="red.500">
            Insufficient Balance!
          </Box>
        ),
      });
    }

    try {
      const vtCon = await VTokenContract();
      console.log(vtCon);
      const currentMint = await vtCon.mint();
      // setMintName(currentMint);
      console.log(currentMint);
    } catch (error) {
      console.log(error);
    }

    try {
      const vtCon = await VTokenContract();
      console.log(vtCon);
      const tx = await vtCon.mint({value: parseEther(mintValue),});
      const receipt = await tx.wait(1);
      if (receipt.status) {
        toast({
          position: 'bottom-left',
          render: () => (
            <Box color="white" p={3} bg="green.500">
              Transaction successful
            </Box>
          ),
        });
      }
      console.log(receipt);
    } catch (error) {
      console.log(error);
    }
  };

  const walletConnection = () => {
    try {
      checkMetamask();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            {chainError && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Wrong Network!</AlertTitle>
                <AlertDescription>
                  Switch network to BNB Testnet
                </AlertDescription>
              </Alert>
            )}
            <Text>Mint Contract</Text>
            <Text>{account}</Text>
            <Text>{myBalance}</Text>
            <Button onClick={walletConnection} disabled={account}>
              {account ? 'Connected' : 'Connect Wallet'}
            </Button>
            <HStack spacing="24px">
              <Button onClick={mint}>Mint</Button>
              <Text>{account}</Text>
            </HStack>
            <HStack spacing="24px">
              <Input
                value={""}
                onChange={e => setMintValue(e.target.value)}
              ></Input>
              <Button onClick={mint}>Mint Token</Button>
            </HStack>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
