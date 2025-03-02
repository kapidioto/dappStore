import { useCallback, useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Dappazon from './abis/Dappazon.json'

// Config
import config from './config.json'

function App() { 
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [dappStore, setDappstore] = useState(null)

  const [electronics, setElectronics] = useState(null)
  const [clothing, setClothing] = useState(null)
  const [toys, setToys] = useState(null)

  const [item, setItem] = useState({})

  const [toggle, setToggle] = useState(false)

  const togglePop = (item) => {
    setItem(item)
    console.log(item)
    toggle ? setToggle(false):setToggle(true)
  }

  const loadBlockchainData = async () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()

    const dappStore = new ethers.Contract(
      config[network.chainId].dappazon.address,
      Dappazon,
      provider
    )
    setDappstore(dappStore)

    const items = []

    for(let i = 0; i<9;i++){
      const item = await dappStore.items(i+1)
      items.push(item)
    }

    const electronics = items.filter((item) => item.category === 'electronics')
    setElectronics(electronics)
    const clothing = items.filter((item) => item.category === 'clothing')
    setClothing(clothing)
    const toys = items.filter((item) => item.category === 'toys')
    setToys(toys)
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount}/>
      <h2>Welcome to DappStore</h2>

      {electronics && clothing && toys && (
        <div>
          <Section title={"Clothing & Jewelry"} items={clothing} togglePop={togglePop} />
          <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop} />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />
        </div>
      )}

      {toggle && (
        <Product item={item} provider={provider} account={account} dappStore={dappStore} togglePop={togglePop}/>
      )}
    </div>
  );
}

export default App;
