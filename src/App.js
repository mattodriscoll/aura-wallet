import React, { useState, useMemo } from 'react';
import { Keypair, Connection, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction, PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';
import './App.css';

// Polyfill Buffer
window.Buffer = Buffer;

// Import the CSS for the wallet adapter UI
import '@solana/wallet-adapter-react-ui/styles.css';

// Your QuickNode endpoint
const QUICKNODE_ENDPOINT = 'https://young-dark-moon.solana-mainnet.quiknode.pro/f1c690a673edfa0c1d03bceee62aa1a28758037f';

function AuraWallet() {
  const [wallet, setWallet] = useState(null); // For programmatically created wallet
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(0);
  const { publicKey, sendTransaction, connected } = useWallet(); // For connected wallet

  const createWallet = () => {
    const keypair = Keypair.generate();
    setWallet(keypair);
    console.log("Wallet created:", keypair.publicKey.toString());
    alert(`New wallet created!\nPublic Key: ${keypair.publicKey.toString()}\nPrivate Key: ${Buffer.from(keypair.secretKey).toString('hex')}\n\nSave the private key securely!`);
  };

  const checkBalance = async () => {
    const connection = new Connection(QUICKNODE_ENDPOINT, 'confirmed');
    try {
      let balance;
      if (wallet) {
        balance = await connection.getBalance(wallet.publicKey);
      } else if (publicKey) {
        balance = await connection.getBalance(publicKey);
      } else {
        alert("No wallet connected or created.");
        return;
      }
      setBalance(balance / LAMPORTS_PER_SOL); // Convert lamports to SOL
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      alert("Failed to fetch balance. Please try again later.");
    }
  };

  const sendSol = async () => {
    const connection = new Connection(QUICKNODE_ENDPOINT, 'confirmed');
    try {
      // Validate recipient address
      const recipientPublicKey = new PublicKey(recipient);
      console.log("Recipient Public Key:", recipientPublicKey.toString());

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet ? wallet.publicKey : publicKey,
          toPubkey: recipientPublicKey,
          lamports: amount * LAMPORTS_PER_SOL, // Convert SOL to lamports
        })
      );

      let signature;
      if (wallet) {
        // Sign and send the transaction using the programmatically created wallet
        signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
      } else if (publicKey) {
        // Sign and send the transaction using the connected wallet
        signature = await sendTransaction(transaction, connection);
      } else {
        alert("No wallet connected or created.");
        return;
      }

      console.log("Transaction successful:", signature);
      alert(`Transaction successful! Signature: ${signature}`);
      checkBalance(); // Refresh balance
    } catch (error) {
      console.error("Failed to send SOL:", error);
      alert(`Failed to send SOL: ${error.message}`);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Aura Wallet</h1>
      <WalletMultiButton /> {/* Connect Wallet button */}
      <button
        onClick={createWallet}
        style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}
      >
        Create Wallet
      </button>

      {(wallet || publicKey) ? (
        <div>
          <p>Public Key: {wallet ? wallet.publicKey.toString() : publicKey.toString()}</p>
          <p>Balance: {balance} SOL</p>
          <button onClick={checkBalance} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}>
            Check Balance
          </button>

          <div style={{ marginTop: '20px' }}>
            <h2>Send SOL</h2>
            <input
              type="text"
              placeholder="Recipient Public Key"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{ padding: '10px', width: '300px', margin: '10px' }}
            />
            <input
              type="number"
              placeholder="Amount (SOL)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ padding: '10px', width: '300px', margin: '10px' }}
            />
            <button onClick={sendSol} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}>
              Send SOL
            </button>
          </div>
        </div>
      ) : (
        <p>Please connect or create a wallet to get started.</p>
      )}
    </div>
  );
}

export default function AppWrapper() {
  // Use the QuickNode endpoint
  const endpoint = useMemo(() => QUICKNODE_ENDPOINT, []);

  // Supported wallets (Phantom, etc.)
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <AuraWallet />
      </WalletModalProvider>
    </WalletProvider>
  );
}
