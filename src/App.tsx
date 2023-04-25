import { AE_AMOUNT_FORMATS } from '@aeternity/aepp-sdk';
import { useEffect, useState } from 'react';

import './App.css';
import logo from './assets/logo.svg';
import loadingLogo from './assets/loading-logo.svg';
import useAeternitySDK from './hooks/useAeternitySDK';
import network from "./configs/network";

enum WalletConnectionStatus {
	Connecting,
	Connected,
	Error
}

const App = () => {
	const { isSdkReady, aeSdk, wallet, getSdk } = useAeternitySDK();
	const [address, setAddress] = useState(null);
	const [balance, setBalance] = useState('loading...');
	const [status, setStatus] = useState<WalletConnectionStatus>(WalletConnectionStatus.Connecting)
	const [walletNetworkId, setWalletNetworkId] = useState<string>("")

	useEffect(() => {
		(async () => {
			await getSdk();
		})();
	}, [])

	useEffect(() => {
		// Callback if wallet switches active account
		const handleAddressChange = async function() {
			const _address: any = await aeSdk.address()
			setAddress(_address);
			const _balance: any = await aeSdk.getBalance(_address, {
				format: AE_AMOUNT_FORMATS.AE
			});
			setBalance(_balance);
		}

		// Callback if wallet switches network
		const handleNetworkChange = async function (walletNetworkId: string) {
			setWalletNetworkId(walletNetworkId);
			// In this example, we support only testnet hence set error if wallet is connected to the mainnet
			if (walletNetworkId !== network.id) {
				setStatus(WalletConnectionStatus.Error);
				return;
			}
			setStatus(WalletConnectionStatus.Connected);
		}

		if (isSdkReady) {
			aeSdk.onNetworkChange = ({ networkId }: { networkId: string }) => handleNetworkChange(networkId);
			aeSdk.onAddressChange = ({ current, connected }: any) => handleAddressChange();

			// Check network
			handleNetworkChange(wallet.networkId);
			// Use the call back to update account details
			handleAddressChange();
		}
	}, [isSdkReady]);


	return (
		<div className="App">
			<header className="App-header">
				<div>
					{status === WalletConnectionStatus.Connecting &&
						<div>
							<img src={loadingLogo} alt="logo" />
							<h6>Searching for Wallet ...</h6>
						</div>
					}
				</div>
				<div>
					{status === WalletConnectionStatus.Error &&
						<div>
							<img src={logo} alt="logo" />
							<h6>Current network "{walletNetworkId}" is not supported. Please switch network in the wallet.</h6>
						</div>
					}
				</div>
				<div>
					{status === WalletConnectionStatus.Connected &&
						<div>
							<img src={logo} alt="logo" />
							<h6>Account: {address}</h6>
							<h6>Balance: {balance}</h6>
							<h6> Connected to wallet "{wallet.name}" on network "{ walletNetworkId }"</h6>
						</div>
					}
				</div>
			</header>
		</div>
	);
};

export default App;
