import hre from "hardhat";

async function main() {
    const AuditLogAnchor = await hre.ethers.getContractFactory("AuditLogAnchor");
    const anchor = await AuditLogAnchor.deploy();

    await anchor.waitForDeployment();

    console.log(`AuditLogAnchor deployed to: ${await anchor.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
