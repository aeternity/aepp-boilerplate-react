import {
	AeSdkAepp,
	BrowserWindowMessageConnection,
	Node,
	SUBSCRIPTION_TYPES,
	walletDetector,
 } from '@aeternity/aepp-sdk';
import { useState } from 'react';

import network from '../configs/network';

let aeSdk: AeSdkAepp;
let wallet: Record<string, any>;

/**
 * æternitySDK Hook
 *
 */
const useAeternitySDK = () => {
const [isSdkReady, setSdkReady] = useState<Boolean>(false);

	const initSdk = async () => {
			const node = {
				nodes: [
					{
						name: network.id,
						instance: new Node(network.url),
					},
				],
				compilerUrl: network.compilerUrl,
			};

			aeSdk = new AeSdkAepp({
					name: "aepp-boilerplate",
				...node,
				onAddressChange: ({ current }) => console.log('new address'),
				onNetworkChange: (params) => console.log('network changed'),
				onDisconnect: () => {
					return new Error('Disconnected');
				},
			});

		// Create connection bridge
		const scannerConnection = new BrowserWindowMessageConnection();
		// Callback to handle wallet information
		const handleNewWallet = async ({ wallets, newWallet }: any) => {
			newWallet = newWallet || Object.values(wallets)[0]
			if(aeSdk) {
				await aeSdk.connectToWallet(await newWallet.getConnection())
				await aeSdk.subscribeAddress(SUBSCRIPTION_TYPES.subscribe, "current")
				stopScan();
				wallet = newWallet.info;
				setSdkReady(true);
			}
		};
		// Use wallet detector method from SDK to start scanning for wallets
		const stopScan = walletDetector(scannerConnection, handleNewWallet.bind(this));
	}

	const getSdk = async () => {
		if(aeSdk) return aeSdk;
		await initSdk();
		return aeSdk;
	}

	return { isSdkReady, aeSdk, wallet, getSdk};
}

export default useAeternitySDK;
