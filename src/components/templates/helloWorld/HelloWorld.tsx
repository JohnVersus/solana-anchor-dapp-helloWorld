import { Heading, Box, useColorModeValue, Button, Flex, Code } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Program, setProvider, AnchorProvider, Idl } from '@project-serum/anchor';
import idl from './idl/anchor_hello_world.json';
const HelloWorld: FC = () => {
  const hoverTrColor = useColorModeValue('gray.100', 'gray.700');
  const [status, setStatus] = useState('');
  const [txLogs, setTxLogs] = useState<string[]>(['']);

  const wallet = useAnchorWallet();
  const connection = new Connection(clusterApiUrl('devnet'));

  const programId = idl.metadata.address;
  const PROGRAM_KEY = new PublicKey(programId);
  const runHelloWorld = async () => {
    if (!wallet) {
      throw new Error('No Wallet available');
    }

    const provider = new AnchorProvider(connection, wallet, {});
    setProvider(provider);
    const program = new Program(idl as Idl, PROGRAM_KEY, provider);
    if (!idl) {
      throw new Error('Invalid IDL');
    }
    if (!wallet.publicKey) {
      throw new Error('Missing Wallet Public Key');
    }
    setStatus('Processing Transaction');
    setTxLogs(['']);
    try {
      const signature = await program.methods.sayHello().rpc({
        preflightCommitment: 'processed',
      });
      const txdata = await connection.getParsedTransaction(signature);
      if (txdata?.meta?.logMessages) {
        setTxLogs(txdata?.meta?.logMessages);
      }
      console.log({ data: txdata?.meta?.logMessages });
      console.log(signature);
      setStatus('');
    } catch (e) {
      console.log(e);
      setStatus('');
    }
  };

  return (
    <>
      <Heading size="lg" marginBottom={6}>
        Hello World
      </Heading>
      <Box>Test the Hello World Contract below</Box>
      <Flex
        border="2px"
        borderColor={hoverTrColor}
        borderRadius="xl"
        padding="24px 18px"
        alignItems={'center'}
        justifyContent={'center'}
        flexDirection={'column'}
      >
        <Button mt={4} colorScheme="teal" isLoading={status ? true : false} onClick={runHelloWorld}>
          Run Program
        </Button>
        <Flex justifyContent={'right'} flexDirection={'column'} padding="24px 18px">
          <Code color={'green.300'}>{status}</Code>
          {txLogs.map((e, i) => {
            if (e.includes('Program log')) {
              return (
                <Code key={i} color={'green.300'}>
                  {e}
                </Code>
              );
            }
            return null;
          })}
        </Flex>
      </Flex>
    </>
  );
};

export default HelloWorld;
