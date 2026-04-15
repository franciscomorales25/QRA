const hre = require("hardhat");

async function main() {
  const Asistencia = await hre.ethers.getContractFactory("Asistencia");
  const asistencia = await Asistencia.deploy();
  await asistencia.waitForDeployment();

  const address = await asistencia.getAddress();
  console.log("Contrato desplegado en:", address);
  console.log("Clave privada del profesor (cuenta #0 de Hardhat):");
  console.log("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("\nPega esta direccion en frontend/src/App.jsx -> CONTRACT_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
