require('dotenv').config()
const hre = require("hardhat");

// async function main() {
//   const currentTimestampInSeconds = Math.round(Date.now() / 1000);
//   const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
//   const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

//   const lockedAmount = hre.ethers.utils.parseEther("1");

//   const Lock = await hre.ethers.getContractFactory("Lock");
//   const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

//   await lock.deployed();

//   console.log(
//     `Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
//   );
// }

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying BmClubSplitter contract with the account:", deployer.address);

  const SplitterContract = await ethers.getContractFactory("BmClubSplitter");

  const secondaryMarketAddresses = process.env.mumbaiSecondaryAddresses.split(',');
  const secondaryMarketPrecentages = process.env.mumbaiSecondaryPercentages.split(',');

  const secondaryMarketIntPercentages = secondaryMarketPrecentages.map(str => {
      return Number(str);
  });

  const deployed = await SplitterContract.deploy(secondaryMarketAddresses, secondaryMarketIntPercentages);

  console.log("BmClubSplitter is deployed at:", deployed.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
