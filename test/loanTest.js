const { expectRevert, time } = require("@openzeppelin/test-helpers");
const {assertion} = require("@openzeppelin/test-helpers/src/expectRevert");
const {web3} = require("@openzeppelin/test-helpers/src/setup")
const Loan = artifacts.require("Loan.sol");

contract("Loan",(accounts)=>{
    let loan;
    const amount =1000;
    const interest =10;
    const duration = 100;
    const [borrower,lender] = [accounts[1],accounts[2]];

      before(async()=>{
        loan = await Loan.deployed();
    });
  
    it('should not accept lend if not lender', async()=>{
        await expectRevert(loan.lend({from:borrower,value:amount}),"only lender can lend") // 
    });

    it('should not accept lend amount if not exact amount',async()=>{
        await expectRevert(loan.lend({from:lender,value:100}),"can only lend the exact amount")
    });

    it("should accept lend amount", async()=>{
        const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(borrower)); // default balance = 0
        await loan.lend({from:lender,value:amount}); // sending $1000 { from:account[2] to:account[1] }
        const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(borrower)); // Got $1000 in account[1]
        const state  = await loan.state(); // get state default state variable = State.PENDING;
        assert(state.toNumber()==1); // ennum state.PENDING is Arrayof[1] ; 
        assert(balanceAfter.sub(balanceBefore).toNumber()==amount); // account[1] - account[2] subtraction Check is equal to lended amount;
        
    })

    it("should not reimbuse if not borrower", async()=>{
        await expectRevert( loan.reimburse({from: accounts[3], value: amount + interest}), 'only borrower can reimburse')
    
    
    });

    it("should not reimbures if not exact amount", async () => { await expectRevert( loan.reimburse({ from: borrower, value: 50 }), // account[1] adding wei= 50 to this payable smartcontract
    "borrower need to reimburse exactly amount + interest" ); });

    it("should not reimburse of loan has not matured", async () => { await expectRevert( loan.reimburse({ from: borrower, value: amount + interest }),"loan has not matured yet" ); });
    //  account[1] adding wei = 50 + 10 to this payable smartcontract

    it("should reimburse", async () => { time.increase(duration + 10)
        const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(lender));// using web3.js getting getBalance(accounts[2])
        await loan.reimburse({ from: borrower, value: amount + interest }); //  account[1] adding wei = 50 + 10 to this payable smartcontract.

        const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(lender));// using web3.js getting getBalance(accounts[2

        const state = await loan.state(); 
        assert(state.toNumber() === 2); // checking State.CLOSED like arrayof[2];
        assert(balanceAfter.sub(balanceBefore).toNumber() === amount + interest);  // Check == amount + interest ;
}); 

});


    



    
