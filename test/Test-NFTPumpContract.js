const { expect } = require("chai");
const { ethers } = require("hardhat");


let currentToken;
let message1 = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';// '0x079f1BaC0025ad71Ab16253271ceCA92b222C614';
let message2 = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

let messageHash1 = ethers.utils.solidityKeccak256(['string'], [message1]);
let messageHash2 = ethers.utils.solidityKeccak256(['string'], [message2]);
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

if (true == true)
    describe("NFT Pump Tests", function () {
        let buyer, owner, hashValue;

        before(async () => {

            const [owner, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20] = await ethers.getSigners();
            console.log("Owner Address: " + owner.address);
            console.log("Owner Address: " + _1.address);
            let ethBalance = ethers.utils.formatEther(await ethers.provider.getBalance(owner.address));
            console.log("Start Balance: " + ethBalance);

            const currentContract = await ethers.getContractFactory("JHJEvents");
            currentToken = await currentContract.deploy(
                'Test Contract',
                'Test',
                '0xf5e3D593FC734b267b313240A0FcE8E0edEBD69a',
                'https://tmc-suits.s3.us-west-1.amazonaws.com/assets/json/',
                [
                    ethers.utils.getAddress('0x9C3f261e2cc4C88DfaC56A5B46cdbf767eE2f231'),
                    ethers.utils.getAddress('0x608328a456D3205fFBAcD2E00AaFE2eE2471dd17'),
                    ethers.utils.getAddress('0x9EF4c075E19ed467813aCA21A23c6aF309B6D236')
                ],
                [
                    30,
                    25,
                    45
                ]);

            console.log("Deploy");
            await currentToken.deployed();

            console.log("ToggleMint");
            await currentToken.togglePublicMint();

            ethBalance = ethers.utils.formatEther(await ethers.provider.getBalance(owner.address));
            console.log("After Deploy Balance" + ethBalance);

            // // Include process module
            // const process = require('process');

            // // Printing process.env property value
            // console.log(process.env);
        });
        if (true) {
            let eventID, eventID1, eventID2;
            it("Create Event", async function () {
                
                eventID = await currentToken.createAdmissionEvent(
                    'Weekend Fight Mint Open 3/1/2022-6/1/2022',
                    1646161578,
                    1654110378,
                    25,
                    5,
                    'https://public-pre-ipfs.s3.amazonaws.com/John_Harding_Jr_NFT/assets/reveal.json',
                    'https://public-pre-ipfs.s3.amazonaws.com/John_Harding_Jr_NFT/assets/reveal.json',
                    true,
                    true);
                const receipt = await eventID.wait()

                for (const event of receipt.events) {
                    console.log(`Event ${event.event} created with value ${event.args}`);
                }
                eventID1 = await currentToken.createAdmissionEvent(
                    'Weekend Fight123 Mint Open 1/1/2022-6/1/2022',
                    1646161578,
                    1654110378,
                    25,
                    5,
                    'https://public-pre-ipfs.s3.amazonaws.com/John_Harding_Jr_NFT/assets/reveal.json',
                    'https://public-pre-ipfs.s3.amazonaws.com/John_Harding_Jr_NFT/assets/reveal1.json',
                    true,
                    false);

                const receipt1 = await eventID1.wait()

                for (const event of receipt1.events) {
                    console.log(`Event ${event.event} created with value ${event.args}`);
                }
                
                eventID2 = await currentToken.createAdmissionEvent(
                    'Weekend Fight1243 Mint Open 1/1/2022-6/1/2022',
                    1649125524, 1651717524, 25, 5,
                    'https://public-pre-ipfs.s3.amazonaws.com/John_Harding_Jr_NFT/assets/reveal.json',
                    'https://public-pre-ipfs.s3.amazonaws.com/John_Harding_Jr_NFT/assets/reveal1.json',
                    true,
                    true);

                let theseEvents = await currentToken.getEvents();
            });

            it("Update Vault", async function () {
                await currentToken.setVaultAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
            });

            it("Mints a General token", async function () {

                const PurchaseArray = [
                    // { amount: 1, value: ".055" },
                    { amount: 1, value: ".275", event : "0" },
                    { amount: 1, value: ".275", event : "0" },
                    { amount: 1, value: ".275", event : "1" },
                    { amount: 1, value: ".275", event : "0" },
                    { amount: 1, value: ".275", event : "1" }
                ];

                const [adminWallet, userWallet] = await ethers.getSigners();
                const timestamp = Date.now();

                //Step 4: Turn on Sales
                const PreMintCount = await currentToken.balanceOf(adminWallet.address)
                const totalSupply = await currentToken.totalSupply();

                TotalAmount = +PreMintCount;

                for (let index = 0; index < PurchaseArray.length; index++) {
                    const element = PurchaseArray[index];
                    await currentToken.generalAdmissionMint(element.event, element.amount, { value: ethers.utils.parseEther(element.value) });
                    TotalAmount = TotalAmount + element.amount;
                }

                const totalSupply2 = await currentToken.totalSupply();

                expect(parseInt(totalSupply)).to.lessThan(parseInt(totalSupply2));
            });

            it("Mints a Ringside token", async function () {

                const PurchaseArray = [
                    // { amount: 1, value: ".055" },
                    { amount: 1, value: ".075", event : "0" },
                    { amount: 1, value: ".075", event : "0" },
                    { amount: 1, value: ".075", event : "1" },
                    { amount: 1, value: ".075", event : "0" },
                    { amount: 1, value: ".075", event : "1" },
                    { amount: 1, value: ".075", event : "1" }
                ];

                const [adminWallet, userWallet] = await ethers.getSigners();
                const timestamp = Date.now();

                //Step 4: Turn on Sales
                const PreMintCount = await currentToken.balanceOf(adminWallet.address)
                const totalSupply = await currentToken.totalSupply();

                TotalAmount = +PreMintCount;

                for (let index = 0; index < PurchaseArray.length; index++) {
                    const element = PurchaseArray[index];
                    await currentToken.ringSideMint( element.event, element.amount, { value: ethers.utils.parseEther(element.value) });                    
                    TotalAmount = TotalAmount + element.amount;
                }

                const totalSupply2 = await currentToken.totalSupply();

                expect(parseInt(totalSupply)).to.lessThan(parseInt(totalSupply2));
            });

            it("Can't Mint a Ringside for expired event", async function () {

                const PurchaseArray = [
                    // { amount: 1, value: ".055" },
                    { amount: 1, value: ".075", event : "2" }
                ];

                const [adminWallet, userWallet] = await ethers.getSigners();
                const timestamp = Date.now();

                //Step 4: Turn on Sales
                const PreMintCount = await currentToken.balanceOf(adminWallet.address)
                const totalSupply = await currentToken.totalSupply();

                TotalAmount = +PreMintCount;

                for (let index = 0; index < PurchaseArray.length; index++) {
                    const element = PurchaseArray[index];
                    await expect(currentToken.ringSideMint( element.event, element.amount, { value: ethers.utils.parseEther(element.value) })).to.be.revertedWith("Can't mint for this event");
                } 
            });

            it("Can't Mint with Public off", async function () {

                //Disable Mint 
                await currentToken.togglePublicMint();

                await expect(currentToken.generalAdmissionMint(1, 1,
                    {
                        value: ethers.utils.parseEther("0.55")
                    })).to.be.revertedWith("Mint is Closed");
            });

            it('Will set Base URI and check the first token', async () => {
                const totalSupply = await currentToken.totalSupply();

                const actualTotalSupply = parseInt(totalSupply);

                const randomToken = getRandomInt(0, (actualTotalSupply-1));

                await currentToken.setBaseURI("ipfs://google.com/");

                let tokenID = randomToken;
                const eventID = await currentToken.getTokenEvent(tokenID);
                await currentToken.setRevealed(eventID, true);
                const tokenURI = await currentToken.tokenURI(tokenID);
                const tokenEvent = await currentToken.getTokenEventID(tokenID);
                const tokenSeatType = await currentToken.getTokenSeatType(tokenID);
                const tokenTicketID = await currentToken.getTokenEventTicketID(tokenID);
                const endURI = "ipfs://google.com/" + tokenEvent + "/" + tokenSeatType + "/"+ tokenTicketID + ".json"
                expect(tokenURI).to.eq(endURI);
                console.log(endURI);
            });

            it('Will check unrevealed url', async () => {              
                const totalSupply = await currentToken.totalSupply();

                const actualTotalSupply = parseInt(totalSupply);

                const randomToken = getRandomInt(0, (actualTotalSupply-1));
                let tokenID = randomToken;
                const eventID = await currentToken.getTokenEvent(tokenID);
                const event = await currentToken.getEvent(eventID);
                await currentToken.setRevealed(eventID, false);
                const tokenURI = await currentToken.tokenURI(tokenID);
                const tokenEvent = await currentToken.getTokenSeatType(tokenID);
                if(tokenEvent == 0)
                {
                    expect(tokenURI).to.eq(event.generalHiddenMetadataUri);
                }
                else
                {
                    expect(tokenURI).to.eq(event.ringsideHiddenMetadataUri);
                }
                await currentToken.setRevealed(eventID, true);
            });

            it('Transfer four tokens to destination account', async () => {
                const [adminWallet, userWallet] = await ethers.getSigners();

                const howManyToTransfer = 5;
                const FirstBalance = await currentToken.balanceOf(adminWallet.address);
                const SecondBalance = await currentToken.balanceOf(userWallet.address);

                for (let index = 1; index <= howManyToTransfer; index++) {
                    await currentToken.transferFrom(adminWallet.address, userWallet.address, index);
                }

                // expect(await currentToken.balanceOf(adminWallet.address)).to.eq(FirstBalance - howManyToTransfer);
                // expect(await currentToken.balanceOf(userWallet.address)).to.eq(SecondBalance + howManyToTransfer);
            });          

            it("Set Multiple Parameters", async function () {
                await currentToken.setParams('70000000000000000', '50000000000000000', '20', true);
            });

            it("Gets Total Supply", async function () {
                const [adminWallet, userWallet] = await ethers.getSigners();

                const totalSupply = await currentToken.totalSupply();

                expect(parseInt(totalSupply)).to.greaterThan(0);

                console.log("Total Supply: " + parseInt(totalSupply))
            });

            it("Gets Total Events", async function () {
                const [adminWallet, userWallet] = await ethers.getSigners();

                const totalEvents = await currentToken.totalEvents();

                expect(parseInt(totalEvents)).to.greaterThan(0);

                console.log("Total Events: " + parseInt(totalEvents))
            });

            it("Get Money Withdraw", async function () {
                const [owner, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20] = await ethers.getSigners();

                let ethBalance = ethers.utils.formatEther(await ethers.provider.getBalance(owner.address));

                console.log("Pre Withdrawal Balance: " + ethBalance);

                let contractEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(currentToken.address));
                console.log("Contract Balance: " + contractEthBalance);

                await currentToken.wfs();

                ethBalance = ethers.utils.formatEther(await ethers.provider.getBalance(owner.address));

                console.log("Final Balance: " + ethBalance);

                contractEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(currentToken.address));
                console.log("Contract Balance: " + contractEthBalance);
            });

            it("Gets Events", async function () {
                const [adminWallet, userWallet] = await ethers.getSigners();

                const totalEvents = await currentToken.getEvents();

                console.log(totalEvents)
            });

            it("Get Token URI's", async () => {
                const totalSupply = await currentToken.totalSupply();

                const actualTotalSupply = parseInt(totalSupply);
                for (let index = 0; index < actualTotalSupply; index++) {
                    // const randomToken = getRandomInt(0, (actualTotalSupply-1));
                    // console.log(index);
                    //await currentToken.setBaseURI("ipfs://google.com/");
    
                    let tokenID = index;
                    // const eventID = await currentToken.getTokenEvent(tokenID);
                    // console.log("Event ID:" + eventID)
                    // await currentToken.setRevealed(eventID, true);
                    const tokenURI = await currentToken.tokenURI(tokenID);
                    // const tokenEvent = await currentToken.getTokenEventID(tokenID);
                    // const endURI = "ipfs://google.com/" + tokenEvent + "/" + tokenID + ".json"
                    // expect(tokenURI).to.eq(endURI);
            //        console.log(tokenURI);
                    
                }
                
            });

            it("Burn Token", async function () {

                const [adminWallet, userWallet] = await ethers.getSigners();

                let signature = await adminWallet.signMessage(ethers.utils.arrayify(messageHash1));

                const totalSupply = await currentToken.totalSupply();
                await currentToken.burn(1);
                const totalSupply2 = await currentToken.totalSupply();
                //expect(parseInt(totalSupply)).to.greaterThan(parseInt(totalSupply2));
            });
        }
    })
