import { AeSdkAepp, AE_AMOUNT_FORMATS } from '@aeternity/aepp-sdk';

import './App.css';
import logo from './assets/logo.svg';
import loadingLogo from './assets/loading-logo.svg';
import useAeternitySDK from './hooks/useAeternitySDK';
import network from "./configs/network";
import { MutableRefObject, useEffect, useRef, useState } from 'react';

// 
const WalletConnectionStatus = Object.freeze({
	Error: 0,
	Connecting: 1,
	Connected: 2,
});


const App = () => {
	const [client, clientReady] = useAeternitySDK();
	const [address, setAddress] = useState(null);
	const [balance, setBalance] = useState('loading...');
	const [errorMsg, setErrorMsg] = useState<string>("");
	const [status, setStatus] = useState(WalletConnectionStatus.Connecting)
	
	const aeSdk: MutableRefObject<AeSdkAepp | null> = useRef(null);
	

	const fetchAccountDetails = async function (walletNetworkId: string) {
    if (!aeSdk.current) return;
		if (status !== WalletConnectionStatus.Error && walletNetworkId !== network.id) {
			setErrorMsg(`Connected to the wrong network "${walletNetworkId}". please switch to "${network.id}" in your wallet.`)
			setStatus(WalletConnectionStatus.Error);
		} else if(status !== WalletConnectionStatus.Connected){
			setStatus(WalletConnectionStatus.Connected);

			const _address: any = await aeSdk.current.address()
			setAddress(_address);

			const _balance: any = await aeSdk.current.getBalance(_address, {
				format: AE_AMOUNT_FORMATS.AE
			});
			setBalance(_balance);
		}
	}

	useEffect(() => {
		if (clientReady && client) {
			aeSdk.current = client.current.aeSdk;

      if (!aeSdk.current) return;
			aeSdk.current.onNetworkChange = (params) => fetchAccountDetails(params.networkId);
			fetchAccountDetails(client.current.walletNetworkId);
		}
	}, [clientReady, client]);


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
							<h6>{errorMsg}</h6>
						</div>
					}
				</div>
				<div>
					{status === WalletConnectionStatus.Connected &&
						<div>
							<img src={logo} alt="logo" />
							<h6>Account address: {address}</h6>
							<h6>Balance: {JSON.stringify(balance)}</h6>
						</div>
					}
				</div>
			</header>
		</div>
	);
};

export default App;
