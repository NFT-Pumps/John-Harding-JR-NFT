async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer Address: " + deployer.address)
    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    //const Token = await ethers.getContractFactory("SomethingSomething");
    const Token = await ethers.getContractFactory("JHJEvents");
    //const token = await Token.deploy('0x079f1BaC0025ad71Ab16253271ceCA92b222C614');
    const token = await Token.deploy(
        'John Harding Jr NFT',
        'JHJNFT',
        '0xf5e3D593FC734b267b313240A0FcE8E0edEBD69a',
        'https://public-pre-ipfs.s3.amazonaws.com/John_Harding_Jr_NFT/json/',
        'https://public-pre-ipfs.s3.amazonaws.com/John_Harding_Jr_NFT/assets/reveal.json',
        [
            ethers.utils.getAddress('0x0E9b19B9e3345eA39fE364D0CDEe2B9EAC9Ff37c'),
            ethers.utils.getAddress('0xc7Dd061E849Ec2E1EE7820cb344bF8de25d80DEB'),
            ethers.utils.getAddress('0x9DCc8aac81d41FCB1e94461C55Ad23DC74b4b8FC'),
        ],
        [
            10,
            75,
            15
        ]);

    console.log("Token address:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });