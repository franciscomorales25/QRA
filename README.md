# 📋 Asistencia QR + Blockchain

> Sistema descentralizado de registro de asistencia usando **QR codes** y **Smart Contracts** en Ethereum. El profesor genera un QR por clase y los estudiantes lo escanean para marcar asistencia — todo queda registrado de forma permanente e inmutable en la blockchain.

---

## ✨ Caracteristicas

- 🔐 **Inmutable** — Las asistencias quedan grabadas en blockchain, nadie puede modificarlas
- 📱 **QR en tiempo real** — El profesor genera el codigo QR al instante
- 📷 **Escaneo desde camara** — Los estudiantes escanean con la camara del dispositivo
- 👨‍🏫 **Roles automaticos** — El sistema detecta si eres profesor o estudiante por tu wallet
- ⛓️ **Sin servidor central** — Todo corre en el smart contract, sin base de datos
- 🌐 **Funciona en local y en Sepolia** (testnet publica)

---

## 🛠️ Tecnologias

| Capa | Tecnologia |
|---|---|
| Smart Contract | Solidity 0.8.20 |
| Blockchain local | Hardhat |
| Frontend | React 18 + Ethers.js v6 |
| QR Generacion | qrcode.react |
| QR Escaneo | html5-qrcode |
| Wallet | MetaMask |

---

## 📁 Estructura del Proyecto

```
qrsolid/
├── contracts/
│   └── Asistencia.sol        # Smart contract principal
├── scripts/
│   ├── deploy-local.js       # Deploy en Hardhat local
│   ├── deploy.js             # Deploy en Sepolia
│   └── fund.js               # Fondear cuentas de prueba
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.jsx           # App completa (edita CONTRACT_ADDRESS aqui)
│       └── index.jsx
├── hardhat.config.js
├── package.json
├── .env.example
├── GUIA-ESTUDIANTES.md
└── README.md
```

---

## 🚀 Instalacion y Uso

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [MetaMask](https://metamask.io/) instalado en **Chrome**
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/qrsolid.git
cd qrsolid
```

### 2. Instalar dependencias

```bash
# Dependencias del contrato
npm install

# Dependencias del frontend
cd frontend && npm install && cd ..
```

---

## 🔷 Opcion A — Red Local (Hardhat)

Ideal para desarrollo y pruebas. No necesitas ETH real.

### Paso 1 — Iniciar la blockchain local

```bash
node_modules\.bin\hardhat.cmd node
```

> Deja esta terminal abierta. Muestra 20 cuentas con **10,000 ETH** de prueba cada una.

### Paso 2 — Desplegar el contrato (nueva terminal)

```bash
node scripts/deploy-local.js
```

Salida esperada:
```
Contrato desplegado en: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Clave privada del profesor: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Paso 3 — Configurar MetaMask en Chrome

Agrega la red manualmente:

| Campo | Valor |
|---|---|
| Nombre de red | `Hardhat Local` |
| URL RPC | `http://127.0.0.1:8545` |
| Chain ID | `1337` |
| Simbolo | `ETH` |

**Importar cuenta del Profesor:**
```
Clave: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Wallet: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Importar cuentas de Estudiantes (tienen 10,000 ETH de prueba):**
```
Estudiante 1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Estudiante 2: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Estudiante 3: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

### Paso 4 — Iniciar el frontend

```bash
cd frontend && npm start
```

Abre automaticamente [http://localhost:3000](http://localhost:3000)

---

## 🌐 Opcion B — Red Sepolia (Testnet publica)

Para demostrar el proyecto a otras personas sin necesidad de correr un nodo local.

### Paso 1 — Conseguir ETH de prueba

- [https://sepoliafaucet.com](https://sepoliafaucet.com)
- [https://faucet.sepolia.dev](https://faucet.sepolia.dev)

### Paso 2 — Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:
```env
PRIVATE_KEY=tu_clave_privada_sin_0x
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/tu_project_id
```

> Consigue una RPC URL gratis en [Infura](https://infura.io) o [Alchemy](https://alchemy.com)

### Paso 3 — Desplegar en Sepolia

```bash
node_modules\.bin\hardhat.cmd run scripts/deploy.js --network sepolia
```

### Paso 4 — Configurar el frontend

Edita `frontend/src/App.jsx` lineas 10-11:

```js
const CONTRACT_ADDRESS = "0xTuDireccionEnSepolia";
const CHAIN_ID = 11155111; // Sepolia
```

### Paso 5 — Iniciar el frontend

```bash
cd frontend && npm start
```

---

## 🎮 Como Usar la App

### 👨‍🏫 Vista del Profesor

1. Conecta MetaMask con la **cuenta del profesor** (la que desplegó el contrato)
2. El sistema te detecta automaticamente como **Profesor**
3. Escribe el **ID de clase** (numero unico) y el **nombre de la clase**
4. Clic en **"Crear Clase y Generar QR"**
5. Confirma la transaccion en MetaMask
6. Aparece el **codigo QR** — muestralo en pantalla a los estudiantes

### 🎓 Vista del Estudiante

1. Conecta MetaMask con una **cuenta de estudiante**
2. Primera vez: escribe tu **nombre completo** y clic en **"Registrar Nombre"**
   - Esto guarda tu nombre en la blockchain (solo se hace una vez)
   - Confirma la transaccion en MetaMask
3. Clic en **"Abrir Camara y Escanear QR"**
4. Apunta la camara al QR del profesor
5. Clic en **"Confirmar Asistencia"**
6. Confirma la transaccion — tu asistencia queda grabada para siempre

---

## ⛓️ El Smart Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Asistencia {
    address public profesor;
    mapping(uint256 => mapping(address => bool)) public asistencias;
    mapping(uint256 => string) public nombreClases;
    mapping(address => string) public nombres;

    constructor() { profesor = msg.sender; }

    function registrarNombre(string memory nombre) external;
    function crearClase(uint256 claseId, string memory nombre) external;
    function marcarAsistencia(uint256 claseId) external;
}
```

### Funciones del contrato

| Funcion | Quien la llama | Descripcion |
|---|---|---|
| `registrarNombre(nombre)` | Estudiante | Registra nombre en blockchain (una sola vez) |
| `crearClase(id, nombre)` | Profesor | Crea una clase con ID unico |
| `marcarAsistencia(claseId)` | Estudiante | Marca asistencia (no se puede repetir) |
| `asistencias(claseId, address)` | Cualquiera | Consulta si alguien asistio |
| `nombres(address)` | Cualquiera | Consulta el nombre de una wallet |

---

## 🔄 Flujo Completo

```
PROFESOR                          BLOCKCHAIN                    ESTUDIANTE
   |                                   |                             |
   |-- crearClase(1, "Matematicas") -->|                             |
   |<-- TX confirmada -----------------|                             |
   |                                   |                             |
   |-- Genera QR con claseId=1         |                             |
   |                                   |                             |
   |                                   |<-- registrarNombre("Ana") --|
   |                                   |-- TX confirmada ----------->|
   |                                   |                             |
   |-- Muestra QR a estudiantes        |                             |
   |                                   |                             |
   |                                   |<-- marcarAsistencia(1) -----|
   |                                   |-- TX confirmada ----------->|
   |                                   |                             |
   |                                   | asistencias[1][Ana] = true  |
```

---

## 🔍 Ver el Codigo en VS Code

```bash
code C:\Users\fmora\qrsolid
```

Archivos clave a revisar:

- **`contracts/Asistencia.sol`** — Logica de negocio en blockchain
- **`frontend/src/App.jsx`** — Interfaz completa: wallet, QR, transacciones
- **`hardhat.config.js`** — Configuracion de redes

---

## ❓ Preguntas Frecuentes

**¿Por que usar blockchain para esto?**
Porque ninguna entidad central controla los datos. El profesor no puede borrar asistencias, ni el estudiante puede falsificarlas. La verdad esta en el contrato.

**¿Que pasa si reinicio el nodo Hardhat?**
Los datos se pierden (es una blockchain temporal). Para persistencia real usa Sepolia u otra red publica.

**¿Pueden dos estudiantes marcar asistencia con el mismo QR?**
Si, pero cada wallet solo puede marcar una vez por clase. El contrato rechaza duplicados.

**¿El profesor puede ver quien asistio?**
Si, consultando `asistencias(claseId, address)` en el contrato directamente, o se puede extender la app para mostrar la lista.

**¿Funciona en celular?**
Si, MetaMask tiene app movil con navegador integrado. Abre la URL de tu frontend desde ahi.

---

## 📄 Licencia

MIT — Libre para usar, modificar y distribuir.

---

<div align="center">
  Hecho con Solidity, React y MetaMask
</div>
