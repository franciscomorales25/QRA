const hre = require("hardhat");

async function main() {
  const Asistencia = await hre.ethers.getContractFactory("Asistencia");
  const asistencia = await Asistencia.deploy();
  await asistencia.waitForDeployment();

  const address = await asistencia.getAddress();
  console.log("Contrato desplegado en Sepolia:", address);
  console.log("\nPega esta direccion en frontend/src/App.jsx -> CONTRACT_ADDRESS");
  console.log("Y cambia CHAIN_ID a 11155111");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
