const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("DappStore", () => {

  let transaction

  const ID = 1
  const NAME = "Shoes"
  const CATEGORY = "Clothing"
  const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
  const COST = tokens(1)
  const RATING = 4
  const STOCK = 5

  
  let dappStore
  let owner, customer
  beforeEach(async () => {
    [owner, customer ] = await ethers.getSigners()

    const dapp = await ethers.getContractFactory("DappStore")
    dappStore = await dapp.deploy({gasLimit: 5000000})
  })

  describe("Deployment", () => {
    it('has a name', async () => {
      const name = await dappStore.name()
      expect(name).to.equal("DappStore")
    })

    it("has owner",async ()=>{
      expect(await dappStore.owner()).to.eq(owner.address)
    })
  describe("Listing", () => {
    
    beforeEach(async () => {
      transaction = await dappStore.list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )

      await transaction.wait()
    })
    it("returns item attributes", async () => {
      const item = await dappStore.items(ID)
      expect(item.id).to.eq(ID)
      expect(item.name).to.eq(NAME)
      expect(item.category).to.eq(CATEGORY)
      expect(item.img_url).to.eq(IMAGE)
      expect(item.cost).to.eq(COST)
      expect(item.rating).to.eq(RATING)
      expect(item.stock).to.eq(STOCK)
    })

    it("emits the event", async () => {
      expect(transaction).to.emit(dappStore, "List")
    })

    it("lists only from owner`s name", async () =>{
      await expect(dappStore.connect(customer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )).to.be.reverted
    })
    
  })
  describe("Buy", () => {
    beforeEach(async () => {
      transaction = await dappStore.list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )

      await transaction.wait()

      transaction = await dappStore.connect(customer).buy(ID, {value: COST})
    })
    it("updates balance of contract", async () => {
      const res = await ethers.provider.getBalance(dappStore.address)
      expect(res).to.eq(COST)
    })
    it("updates customer`s order count", async () => {
      const res = await dappStore.orderCount(customer.address)
      expect(res).to.eq(1)
    })
    it("updates order list", async () => {
      const res = await dappStore.orders(customer.address, 1)

      expect(res.timestamp).to.be.greaterThan(0)
      expect(res.item.name).to.eq(NAME)
    })
    it("emits Buy event", async () => {
      const res = await dappStore.orders(customer.address, 1)

      expect(res).to.emit(dappStore, "Buy")
    })
    it("reverts if there are not enought money", async () => {
      transaction = dappStore.connect(customer).buy(ID, {value: 1000})
      await expect(transaction).to.be.revertedWith("There are not enought funds to finish the transaction")
    })
  })
  describe("Withdrawing", () => {
    let balanceBefore

    beforeEach(async () => {
      // List a item
      let transaction = await dappStore.connect(owner).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

      // Buy a item
      transaction = await dappStore.connect(customer).buy(ID, { value: COST })
      await transaction.wait()

      // Get owner balance before
      balanceBefore = await ethers.provider.getBalance(owner.address)

      // Withdraw
      transaction = await dappStore.connect(owner).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(owner.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(dappStore.address)
      expect(result).to.equal(0)
    })
    it('reverts if not owner try`s to withdraw', async () => {
      transaction = dappStore.connect(customer).withdraw()
      await expect(transaction).to.be.reverted
    })
  })
  })
})
