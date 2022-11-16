require('dotenv').config()

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying BmClubSplitter contract with the account:", deployer.address);

  const SplitterContract = await ethers.getContractFactory("BmClubSplitter");

  const secondaryMarketAddresses = process.env.bsc_tesnet_SecondaryAddresses.split(',');
  const secondaryMarketPrecentages = process.env.bsc_tesnet_SecondaryPercentages.split(',');

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
