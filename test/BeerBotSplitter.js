require('dotenv').config();
const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { BigNumber } = require('ethers');

describe("Splitter tests...", () => {
    const setupBeerBotSplitter = async ({         
        secondaryMarketAddresses = [
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // creator
            "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // artDude
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // leadDude
            "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // devDude
        ],
        secondaryMarketPercentages = [
            29,
            28,
            22,
            21
        ],
    }) => {
        const [creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project] = await ethers.getSigners();
        const Splitter = await ethers.getContractFactory("BmClubSplitter");        
        const deployedSplitter = await Splitter.deploy(secondaryMarketAddresses, secondaryMarketPercentages);
        
        return {
            creator,
            leadDude,
            artirstDude,
            devDude,
            someDudeOne,
            somdeDudeTwo,
            holders,
            project,
            deployedSplitter,            
        };
    }

    // 
    it("Deploys correctly", async () => {
        const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter } = await setupBeerBotSplitter({ });
        console.log("Splitter deployed at... " + deployedSplitter.address);
    });

    //
    it("Only creator splits balance of the splitter contract", async () =>{
        const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter } = await setupBeerBotSplitter({ });
        
        const provider = ethers.provider;
        let creatorStartBalance = await provider.getBalance(creator.address);
        let leadStartBalance = await provider.getBalance(leadDude.address);
        let artistStartBalance = await provider.getBalance(artirstDude.address);
        let devStartBalance = await provider.getBalance(devDude.address);
        let someDudeOneBalance = await provider.getBalance(someDudeOne.address);
        let splitterStartContractBalance = await provider.getBalance(deployedSplitter.address);
        // console.log("starting balances...");
        // console.log("splitter contract balance... "+splitterStartContractBalance);
        // console.log("creator balance... "+creatorStartBalance);
        // console.log("lead balance... "+leadStartBalance);
        // console.log("artist balance... "+artistStartBalance);
        // console.log("dev balance... "+devStartBalance);
        // console.log("----------------------------------------");
        
        let tx = await someDudeOne.sendTransaction({
            from: someDudeOne.address,
            to: deployedSplitter.address,
            value: ethers.utils.parseEther('1')
        });

        creatorStartBalance = await provider.getBalance(creator.address);
        leadStartBalance = await provider.getBalance(leadDude.address);
        artistStartBalance = await provider.getBalance(artirstDude.address);
        devStartBalance = await provider.getBalance(devDude.address);
        someDudeOneBalance = await provider.getBalance(someDudeOne.address);
        splitterStartContractBalance = await provider.getBalance(deployedSplitter.address);
        // console.log("after buy... balances...");
        // console.log("splitter contract balance... "+splitterStartContractBalance);
        // console.log("creator balance... "+creatorStartBalance);
        // console.log("lead balance... "+leadStartBalance);
        // console.log("artist balance... "+artistStartBalance);
        // console.log("dev balance... "+devStartBalance);
        // console.log("----------------------------------------");

        const creatorShare = splitterStartContractBalance.mul(ethers.utils.parseEther('29')).div(ethers.utils.parseEther('100'));            
        const artistShare = splitterStartContractBalance.mul(ethers.utils.parseEther('28')).div(ethers.utils.parseEther('100'));
        const leadShare = splitterStartContractBalance.mul(ethers.utils.parseEther('22')).div(ethers.utils.parseEther('100'));
        const devShare = splitterStartContractBalance.mul(ethers.utils.parseEther('21')).div(ethers.utils.parseEther('100'));

        await expect(deployedSplitter.connect(someDudeOne)["release(address)"](artirstDude.address)).to.be.revertedWith("Ownable: caller is not the owner" );
        
        tx = await deployedSplitter.connect(creator)["release(address)"](creator.address);
        let receipt = await tx.wait();
        let gasSpent = receipt.gasUsed.mul(receipt.effectiveGasPrice);

        tx = await deployedSplitter.connect(creator)["release(address)"](artirstDude.address);
        receipt = await tx.wait();
        gasSpent = gasSpent.add(receipt.gasUsed.mul(receipt.effectiveGasPrice));
        
        tx = await deployedSplitter.connect(creator)["release(address)"](leadDude.address);
        receipt = await tx.wait();
        gasSpent = gasSpent.add(receipt.gasUsed.mul(receipt.effectiveGasPrice));

        tx = await deployedSplitter.connect(creator)["release(address)"](devDude.address);
        receipt = await tx.wait();
        gasSpent = gasSpent.add(receipt.gasUsed.mul(receipt.effectiveGasPrice));

        let splitterContractBalance = await provider.getBalance(deployedSplitter.address);
        let creatorBalance = await provider.getBalance(creator.address);
        let leadBalance = await provider.getBalance(leadDude.address);
        let artistBalance = await provider.getBalance(artirstDude.address);
        let devBalance = await provider.getBalance(devDude.address);
        // console.log("after split... balances...");
        // console.log("splitter contract balance... "+splitterContractBalance);
        // console.log("creator balance... "+creatorBalance);
        // console.log("artist balance... "+artistBalance);
        // console.log("lead balance... "+leadBalance);
        // console.log("dev balance... "+devBalance);
        // console.log("----------------------------------------");

        expect(await splitterContractBalance).to.eq(ethers.utils.parseEther('0'));
        // console.log("splitterContractBalance ok");
        expect(await leadBalance).to.eq(leadStartBalance.add(leadShare));
        // console.log("leadBalance ok");
        expect(await artistBalance).to.eq(artistStartBalance.add(artistShare));
        // console.log("artistBalance ok");
        expect(await devBalance).to.eq(devStartBalance.add(devShare));
        // console.log("devBalance ok");
        expect(await creatorBalance).to.eq(creatorStartBalance.add(creatorShare).sub(gasSpent));
    });

    describe("Withdraws...", async () => {
        it("Withdraws the correct balance to the correct address", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter  } = await setupBeerBotSplitter({ });

            const provider = ethers.provider;

            let creatorStartBalance = await provider.getBalance(creator.address);
            let splitterStartContractBalance = await provider.getBalance(deployedSplitter.address);
            // console.log("creatorStartBalance "+creatorStartBalance);
            // console.log("splitterStartContractBalance "+splitterStartContractBalance);
            
            let sendTx = await someDudeOne.sendTransaction({
                from: someDudeOne.address,
                to: deployedSplitter.address,
                value: ethers.utils.parseEther('1')
            });

            let creatorBlance = await provider.getBalance(creator.address);
            let splittertContractBalance = await provider.getBalance(deployedSplitter.address);
            // console.log("New creatorBlance "+creatorBlance);
            // console.log("New splitterStartContractBalance "+splittertContractBalance);
            
            let balanceStart = await provider.getBalance(creator.address);
            const tx = await deployedSplitter.connect(creator).withdraw();
            const receipt = await tx.wait();
            const gasSpent = receipt.gasUsed.mul(receipt.effectiveGasPrice);
            expectedBalance = balanceStart.add(ethers.utils.parseEther('1'));
            expect(await creator.getBalance()).to.eq(expectedBalance.sub(gasSpent));
    
        });
        
        it("Only creator can withdraw the funds", async () => {
            const { creator, leadDude, artirstDude, devDude, someDudeOne, somdeDudeTwo, holders, project, deployedSplitter } = await setupBeerBotSplitter({ });
            
            let sendTx = await someDudeOne.sendTransaction({
                from: someDudeOne.address,
                to: deployedSplitter.address,
                value: ethers.utils.parseEther('1')
            });

            await expect(deployedSplitter.connect(somdeDudeTwo).withdraw()).to.be.revertedWith("Ownable: caller is not the owner" );
        });
    });

});