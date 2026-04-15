# Guia: Sistema de Asistencia QR + Blockchain

## Que es esto?

Una app donde el **profesor genera un QR** por clase y los **estudiantes lo escanean** para marcar asistencia. Todo queda registrado en una blockchain — nadie puede falsificarlo ni borrarlo.

---

## Para ver el codigo

Abre la carpeta del proyecto en **Visual Studio Code**:

```
File → Open Folder → C:\Users\fmora\qrsolid
```

Archivos importantes:

| Archivo | Que hace |
|---|---|
| `contracts/Asistencia.sol` | El smart contract (las reglas en blockchain) |
| `frontend/src/App.jsx` | Toda la interfaz visual |
| `scripts/deploy-local.js` | Script para desplegar el contrato |
| `hardhat.config.js` | Configuracion de la red |

---

## Para ejecutarlo (RED LOCAL)

Necesitas tener instalado: **Node.js**, **MetaMask** (extension de Chrome)

### Paso 1 — Instalar dependencias (solo la primera vez)

Abre una terminal en la carpeta del proyecto:

```bash
npm install
cd frontend && npm install && cd ..
```

### Paso 2 — Iniciar la blockchain local

```bash
node_modules\.bin\hardhat.cmd node
```

Deja esta terminal abierta. Muestra 20 cuentas con 10,000 ETH de prueba cada una.

### Paso 3 — Desplegar el contrato (nueva terminal)

```bash
node scripts/deploy-local.js
```

Aparece la direccion del contrato: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Paso 4 — Iniciar la app web (nueva terminal)

```bash
cd frontend && npm start
```

Abre automaticamente http://localhost:3000

---

## Configurar MetaMask (Chrome)

1. Instala la extension **MetaMask** en Chrome
2. Agrega la red local:
   - Nombre: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Simbolo: `ETH`
3. Importa la cuenta del **profesor**:
   - Clave privada: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Direccion: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
4. Para estudiantes, importa cualquiera de estas claves (tienen 10,000 ETH):
   - Estudiante 1: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - Estudiante 2: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
   - Estudiante 3: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`

---

## Como usarlo

### El Profesor
1. Conecta MetaMask con la cuenta del profesor
2. Escribe un ID de clase (numero) y nombre
3. Clic en **Crear Clase y Generar QR**
4. Confirma la transaccion en MetaMask
5. Muestra el QR en pantalla a los estudiantes

### El Estudiante
1. Conecta MetaMask con una cuenta de estudiante
2. Escribe tu nombre y clic en **Registrar Nombre** (solo una vez)
3. Confirma la transaccion en MetaMask
4. Clic en **Abrir Camara y Escanear QR**
5. Escanea el QR del profesor
6. Clic en **Confirmar Asistencia**
7. Confirma la transaccion en MetaMask

---

## Como funciona por dentro

```
Estudiante escanea QR
        |
        v
App llama al Smart Contract (marcarAsistencia)
        |
        v
MetaMask firma la transaccion con tu wallet
        |
        v
La transaccion se guarda en la blockchain
        |
        v
Nadie puede cambiarla ni borrarla
```

## El Smart Contract tiene 3 funciones

```solidity
registrarNombre(string nombre)   // Estudiante registra su nombre
crearClase(uint256 id, string nombre)  // Profesor crea una clase
marcarAsistencia(uint256 claseId)      // Estudiante marca asistencia
```

---

## Preguntas frecuentes

**Por que MetaMask?**
Porque cada accion (registrar nombre, marcar asistencia) es una transaccion firmada con tu clave privada. Nadie puede hacerse pasar por ti.

**Que es el Chain ID?**
Es el identificador de la red blockchain. `1337` es la red local de Hardhat para pruebas.

**Se pierden los datos al reiniciar?**
Si. La blockchain local se reinicia cada vez que apagas el nodo. Para datos permanentes se usa una red publica como Sepolia.

**Puedo ver las transacciones?**
Si. En MetaMask en la pestana "Actividad" ves todas las transacciones realizadas.
