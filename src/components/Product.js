import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Rating from './Rating'

import close from '../assets/close.svg'
import copy from '../assets/copy.svg'

const Product = ({ item, provider, account, dappStore, togglePop }) => {
  const [order, setOrder] = useState(null)
  const [owner, setOwner] = useState('')
  const [hasBought, setHasBought] = useState(false)

  const loadOwner = async () => {
    const owner = await dappStore.owner()
    console.log(owner)
    setOwner(owner)
  }

  const fetchDetails = async () => {
    const events = await dappStore.queryFilter("Buy")
    const orders = events.filter(
      (event) => event.args.buyer === account && event.args.itemId.toString() === item.id.toString()
    )

    if (orders.length === 0) return

    const order = await dappStore.orders(account, orders[0].args.orderId)
    setOrder(order)
  }
  
  const buyHandler = async () => {
    const customer = await provider.getSigner()

    let transaction = dappStore.connect(customer).buy(item.id, {value:item.cost})

    await transaction.wait()

    setHasBought(true)
  }

  useEffect(() => {
    loadOwner()
  }, [])

  useEffect(() => {
    fetchDetails()
  }, [hasBought])

  return (
    <div className="product">
      <div className="product__details">
        <div className='product__image'>
          <img src={item.image} alt='Product' />
        </div>
        <div className='product__overview'>
          <h1>{item.name}</h1>
          <Rating value={item.rating}/>
          <hr/>
          <p>{item.address}</p>
          <h2>{ethers.utils.formatUnits(item.cost.toString(), 'ether')} ETH</h2>
          <hr/>
          <h2>Overview</h2>
          <p>{item.description}</p>
        </div>
        <div className='product__order'>
          <h1>{ethers.utils.formatUnits(item.cost.toString(), 'ether')} ETH</h1>
          <p>
            Shipping time<br/>
            <strong>
            {new Date(Date.now() + 345600000).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </strong>
          </p>
          {item.stock>0?(
            <p>Available</p>
          ):(
            <p>Sold out</p>
          )}

          <button className='product__buy' onClick={buyHandler}>Buy Now</button>
          <p><small>Ships from </small>DappStore</p>
          <p><small
            >Sold By </small>{owner.slice(0,6)+"..."+owner.slice(38,42)}
            <button className='copy__address' onClick={async () => {
              await navigator.clipboard.writeText(owner)
              alert('copied to clipboard')
              }}>
              <img src={copy} alt='Close'/>
            </button>
          </p>

          {order && (
            <div className='product__bought'>
              Item sold on <br />
              <strong>
                {new Date(Number(order.time.toString() + '000')).toLocaleDateString(
                  undefined,
                  {
                    weekday: 'long',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                  })}
              </strong>
            </div>
          )}

        </div>
        <button className='product__close' onClick={togglePop}>
          <img src={close} alt='Close'/>
        </button>
      </div>
    </div >
  );
}

export default Product;