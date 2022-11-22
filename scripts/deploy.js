require('dotenv').config()

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying BeerBotSplitter contract with the account:", deployer.address);

  const SplitterContract = await ethers.getContractFactory("BeerBotSplitter");

  const secondaryMarketAddresses = process.env.bsc_mainnet_SecondaryAddresses.split(',');
  const secondaryMarketPrecentages = process.env.bsc_mainnet_SecondaryPercentages.split(',');

  const secondaryMarketIntPercentages = secondaryMarketPrecentages.map(str => {
      return Number(str);
  });

  const deployed = await SplitterContract.deploy(secondaryMarketAddresses, secondaryMarketIntPercentages);

  console.log("BeerBotSplitter is deployed at:", deployed.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
