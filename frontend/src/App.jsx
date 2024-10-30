import {generateMnemonic, mnemonicToSeedSync} from "bip39";
import {useState} from "react";
import {derivePath} from "ed25519-hd-key";
import {Keypair} from "@solana/web3.js";
import nacl from 'tweetnacl';
function App() {
        let [m, setMnemonic] = useState([]);
        let [publicKey, setPublicKey] = useState([{public:"",private:""}]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [mnemonicWords, setMnemonicWords] = useState(Array(12).fill(""));
    const [isWalletCreated, setIsWalletCreated] = useState(false);
    const [showPrivateKey, setShowPrivateKey] = useState(false);

    const handleInputChange = (index, value) => {
        const newWords = [...mnemonicWords];
        newWords[index] = value;
        setMnemonicWords(newWords);
    };

    const handleConfirmMnemonic = () => {

        let masterSeed=mnemonicToSeedSync(mnemonicWords.toString());
        console.log(mnemonicWords.toString());
        console.log(masterSeed);
        for (let i = 0; i < 4; i++) {
            let derivedSeed = derivePath(`m/44'/501'/${i}'/0'`, masterSeed);
            let secretkey = nacl.sign.keyPair.fromSeed(derivedSeed.key).secretKey;
            let publickey = Keypair.fromSecretKey(secretkey).publicKey.toBase58();
            if (i === 0) {
                setPublicKey([{private: Buffer.from(secretkey).toString('hex'), public: publickey}]);
                continue;
            }
            setPublicKey((publicKey) => [...publicKey, {
                private: Buffer.from(secretkey).toString('hex'),
                public: publickey
            }]);
        }


        setIsWalletCreated(true);
        setIsPopupOpen(false);

    };

    return (
        <div
            className="w-full min-h-screen h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 font-digital">
            {/* Navbar */}
            <nav className="fixed top-0 left-0  w-[100%] bg-gray-900 p-4 shadow-lg">
                <h1 className="text-3xl mb-1 text-white font-bold text-center">Sollet</h1>
                <h3 className="text-xl text-blue-600 font-bold text-center">Solona Wallet</h3>
            </nav>

            <div className='mt-24  w-full  max-h-16 flex justify-center space-x-6'>
                <div className="flex justify-center items-center  bg-gray-700 rounded-lg p-5 shadow-lg">
                    <input
                        type="text"
                        className="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none p-2 font-digital"
                        placeholder="Enter Mnemonics..."
                        onClick={() => {
                            setIsPopupOpen(true)
                        }}
                    /></div>


                <button
                    onClick={() => {

                        let mnemonic = generateMnemonic();
                        let mnemonicArray=mnemonic.split(" ");
                        setMnemonic(mnemonicArray);

                        let masterSeed = mnemonicToSeedSync(mnemonic);
                        for (let i = 0; i < 4; i++) {
                            let derivedSeed = derivePath(`m/44'/501'/${i}'/0'`, masterSeed.toString('hex'));
                            let secretKey = nacl.sign.keyPair.fromSeed(derivedSeed.key).secretKey;
                            let publickey = Keypair.fromSecretKey(secretKey).publicKey.toBase58();
                            if (i === 0) {
                                setPublicKey([{private: Buffer.from(secretKey).toString('hex'), public: publickey}]);
                                continue;
                            }
                            setPublicKey((publicKey) => [...publicKey, {
                                private: Buffer.from(secretKey).toString('hex'),
                                public: publickey
                            }]);
                        }
                        setIsWalletCreated(true);
                    }}
                    className="bg-green-500 text-white font-semibold px-6 rounded-lg shadow-lg hover:bg-green-600"
                >
                    Create Wallet
                </button>
            </div>

            {/* Popup for entering mnemonic */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-lg shadow-xl">
                        <h2 className="text-2xl font-bold mb-4">Enter 12-Word Mnemonic</h2>
                        <p className="mb-6">Please enter your 12-word mnemonic phrase below:</p>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {mnemonicWords.map((word, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={word}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    className="bg-gray-700 text-white text-center p-2 rounded-lg focus:outline-none placeholder-gray-400 font-digital"
                                    placeholder={`Word ${index + 1}`}
                                />
                            ))}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setIsPopupOpen(false)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmMnemonic}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className='flex justify-center items-center w-full'>
                <div
                    className={`mt-10 w-[82%]   ${
                        isWalletCreated ? 'opacity-100' : 'opacity-0'
                    }`}
                >

                    <div className='w-full flex justify-center items-center mb-4'>
                    <div className={'bg-gray-700 rounded p-3 w-[60%] px-12'}>
                    <h2 className="text-2xl text-blue-600 font-bold mb-4 text-center">Your 12  Mnemonic Words</h2>
                    <p className="mb-6 text-lg font-bold text-red-600 text-center">Please save these words for recovery purposes.</p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {m.map((word, index) => (
                            <div
                                key={index}
                                className="bg-gray-700 text-white text-center p-1 rounded-lg focus:outline-none placeholder-gray-400 font-digital"

                            >{word}</div>
                        ))}
                    </div>
                    </div>
                    </div>
                    {publicKey.map((wallet, index) => (
                        <div
                            key={index}
                            className="font-tech bg-gray-800 text-white p-6 rounded-lg shadow-lg mb-6"
                        >
                            <h2 className="font-mono text-xl font-bold mb-2 text-indigo-400">Wallet {index + 1}</h2>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <p className="text-gray-300 text-sm mb-1"><strong>Public Key:</strong></p>
                                <p className="text-blue-300 text-xs mb-4 truncate">{wallet.public}</p>
                                <p className="text-gray-300 text-sm mb-1"><strong>Secret Key:</strong></p>
                                <div className='flex space-x-6'>
                                    <p className={`mt-1  text-red-300 text-xs truncate `}>{showPrivateKey ? wallet.private : '●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●'}</p>
                                    <button
                                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                                        className="ml-2 text-gray-400 hover:text-white"
                                    >
                                        {showPrivateKey ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 strokeWidth="1.5" stroke="currentColor" class="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                                            </svg>

                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                                            </svg>

                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App
