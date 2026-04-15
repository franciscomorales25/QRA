const hre = require("hardhat");

async function main() {
  const [profesor] = await hre.ethers.getSigners();

  // Direcciones a fondear - agrega las que necesites
  const destinatarios = process.env.ADDR
    ? [process.env.ADDR]
    : [
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // cuenta #1
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // cuenta #2
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // cuenta #3
      ];

  const monto = hre.ethers.parseEther("100");

  for (const addr of destinatarios) {
    const tx = await profesor.sendTransaction({ to: addr, value: monto });
    await tx.wait();
    console.log(`Enviado 100 ETH a ${addr}`);
  }
  console.log("Listo.");
}

main().catch((e) => { console.error(e); process.exit(1); });
