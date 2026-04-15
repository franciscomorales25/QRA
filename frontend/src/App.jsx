import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

// ============================================================
// CONFIGURACION - EDITA ESTOS VALORES DESPUES DE DESPLEGAR
// ============================================================
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Hardhat local
const CHAIN_ID = 1337;       // 1337 = Local Hardhat | 11155111 = Sepolia
// ============================================================

const CHAIN_NAMES = { 1337: "Hardhat Local", 31337: "Hardhat Local", 11155111: "Sepolia" };

const ABI = [
  "function profesor() view returns (address)",
  "function nombres(address) view returns (string)",
  "function nombreClases(uint256) view returns (string)",
  "function asistencias(uint256, address) view returns (bool)",
  "function registrarNombre(string nombre)",
  "function crearClase(uint256 claseId, string nombre)",
  "function marcarAsistencia(uint256 claseId)"
];

export default function App() {
  const [cuenta, setCuenta] = useState("");
  const [esProfesor, setEsProfesor] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [redCorrecta, setRedCorrecta] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [contract, setContract] = useState(null);

  // Profesor
  const [claseId, setClaseId] = useState("");
  const [claseNombre, setClaseNombre] = useState("");
  const [qrData, setQrData] = useState("");
  const [clasesCreadas, setClasesCreadas] = useState([]);

  // Estudiante
  const [inputNombre, setInputNombre] = useState("");
  const [escaneando, setEscaneando] = useState(false);
  const [claseEscaneada, setClaseEscaneada] = useState(null);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  useEffect(() => {
    if (escaneando) {
      setTimeout(() => iniciarScanner(), 300);
    } else {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear().catch(() => {});
        scannerInstanceRef.current = null;
      }
    }
  }, [escaneando]);

  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 5000);
  };

  const conectarWallet = async () => {
    if (!window.ethereum) {
      mostrarMensaje("Instala MetaMask para continuar", "error");
      return;
    }
    if (!CONTRACT_ADDRESS) {
      mostrarMensaje("Primero despliega el contrato y pega la direccion en App.jsx", "error");
      return;
    }
    try {
      setCargando(true);
      const cuentas = await window.ethereum.request({ method: "eth_requestAccounts" });
      const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
      const chainIdNum = parseInt(chainIdHex, 16);

      if (chainIdNum !== CHAIN_ID) {
        mostrarMensaje("Cambiando a la red correcta...", "info");
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x" + CHAIN_ID.toString(16) }],
          });
        } catch (switchErr) {
          // La red no existe en MetaMask, la agrega automaticamente
          if (switchErr.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x" + CHAIN_ID.toString(16),
                chainName: "Hardhat Local",
                rpcUrls: ["http://127.0.0.1:8545"],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              }],
            });
          } else {
            mostrarMensaje("No se pudo cambiar la red: " + (switchErr.message || ""), "error");
            setCargando(false);
            return;
          }
        }
        // Recarga para aplicar el cambio de red
        window.location.reload();
        return;
      }

      setRedCorrecta(true);
      const addr = cuentas[0];
      setCuenta(addr);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contrato = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      setContract(contrato);

      const profesorAddr = await contrato.profesor();
      const esProf = addr.toLowerCase() === profesorAddr.toLowerCase();
      setEsProfesor(esProf);

      const nombre = await contrato.nombres(addr);
      setNombreUsuario(nombre);

      mostrarMensaje(
        esProf ? "Conectado como PROFESOR" : nombre ? `Bienvenido, ${nombre}` : "Wallet conectada. Registra tu nombre.",
        "exito"
      );
    } catch (err) {
      mostrarMensaje("Error al conectar: " + (err.reason || err.message), "error");
    } finally {
      setCargando(false);
    }
  };

  const registrarNombre = async () => {
    if (!inputNombre.trim()) return mostrarMensaje("Escribe tu nombre", "error");
    try {
      setCargando(true);
      const tx = await contract.registrarNombre(inputNombre.trim());
      mostrarMensaje("Registrando nombre... espera confirmacion", "info");
      await tx.wait();
      setNombreUsuario(inputNombre.trim());
      setInputNombre("");
      mostrarMensaje("Nombre registrado en blockchain", "exito");
    } catch (err) {
      mostrarMensaje("Error: " + (err.reason || err.message), "error");
    } finally {
      setCargando(false);
    }
  };

  const crearClase = async () => {
    if (!claseId || !claseNombre.trim()) return mostrarMensaje("Completa ID y nombre de clase", "error");
    try {
      setCargando(true);
      const tx = await contract.crearClase(Number(claseId), claseNombre.trim());
      mostrarMensaje("Creando clase...", "info");
      await tx.wait();
      const nueva = { id: claseId, nombre: claseNombre.trim() };
      setClasesCreadas(prev => [...prev, nueva]);
      setQrData(JSON.stringify({ contrato: CONTRACT_ADDRESS, claseId: Number(claseId), clase: claseNombre.trim(), chainId: CHAIN_ID }));
      mostrarMensaje(`Clase "${claseNombre}" creada. Muestra el QR a los estudiantes.`, "exito");
    } catch (err) {
      mostrarMensaje("Error: " + (err.reason || err.message), "error");
    } finally {
      setCargando(false);
    }
  };

  const mostrarQr = (clase) => {
    setQrData(JSON.stringify({ contrato: CONTRACT_ADDRESS, claseId: Number(clase.id), clase: clase.nombre, chainId: CHAIN_ID }));
  };

  const iniciarScanner = () => {
    if (!scannerRef.current) return;
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    scanner.render(
      (texto) => {
        try {
          const datos = JSON.parse(texto);
          if (datos.contrato && datos.claseId !== undefined) {
            setClaseEscaneada(datos);
            setEscaneando(false);
            mostrarMensaje(`QR valido: Clase "${datos.clase}" (ID: ${datos.claseId})`, "exito");
          } else {
            mostrarMensaje("QR no valido para este sistema", "error");
          }
        } catch {
          mostrarMensaje("QR no reconocido", "error");
        }
      },
      () => {}
    );
    scannerInstanceRef.current = scanner;
  };

  const marcarAsistencia = async () => {
    if (!claseEscaneada) return mostrarMensaje("Primero escanea un QR", "error");
    if (claseEscaneada.chainId !== CHAIN_ID) {
      return mostrarMensaje("El QR es de otra red", "error");
    }
    try {
      setCargando(true);
      const tx = await contract.marcarAsistencia(claseEscaneada.claseId);
      mostrarMensaje("Marcando asistencia en blockchain...", "info");
      await tx.wait();
      mostrarMensaje(`Asistencia marcada en "${claseEscaneada.clase}"`, "exito");
      setClaseEscaneada(null);
    } catch (err) {
      const msg = err.reason || err.message || "";
      if (msg.includes("Ya marcaste")) mostrarMensaje("Ya tienes asistencia en esta clase", "error");
      else if (msg.includes("Registra nombre")) mostrarMensaje("Registra tu nombre primero", "error");
      else mostrarMensaje("Error: " + msg, "error");
    } finally {
      setCargando(false);
    }
  };

  const colorMensaje = { exito: "#16a34a", error: "#dc2626", info: "#2563eb" };

  const estilos = {
    app: { minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif", padding: "24px 16px" },
    card: { background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "20px" },
    titulo: { fontSize: "26px", fontWeight: "700", color: "#1e293b", margin: "0 0 4px 0" },
    subtitulo: { fontSize: "14px", color: "#64748b", margin: "0 0 24px 0" },
    btn: (color = "#3b82f6") => ({ background: color, color: "white", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "15px", fontWeight: "600", cursor: "pointer", width: "100%", marginTop: "10px", opacity: cargando ? 0.6 : 1 }),
    input: { width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "15px", marginTop: "8px", boxSizing: "border-box", outline: "none" },
    label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
    badge: (color) => ({ display: "inline-block", background: color, color: "white", borderRadius: "20px", padding: "4px 14px", fontSize: "13px", fontWeight: "600", marginBottom: "16px" }),
    seccion: { borderTop: "1px solid #f1f5f9", paddingTop: "20px", marginTop: "20px" },
    row: { display: "flex", gap: "10px" },
    msgBox: (tipo) => ({ background: colorMensaje[tipo] + "15", border: `1px solid ${colorMensaje[tipo]}40`, borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: colorMensaje[tipo], fontWeight: "500", fontSize: "14px" }),
    claseItem: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", borderRadius: "10px", padding: "10px 14px", marginTop: "8px", fontSize: "14px" },
    qrBox: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px", background: "#f8fafc", borderRadius: "12px", marginTop: "16px" },
  };

  return (
    <div style={estilos.app}>
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={estilos.card}>
          <h1 style={estilos.titulo}>Asistencia QR + Blockchain</h1>
          <p style={estilos.subtitulo}>Sistema descentralizado de registro de asistencia</p>

          {mensaje.texto && (
            <div style={estilos.msgBox(mensaje.tipo)}>{mensaje.texto}</div>
          )}

          {!cuenta ? (
            <>
              <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px", lineHeight: "1.6" }}>
                <strong>Red configurada:</strong> {CHAIN_NAMES[CHAIN_ID] || "Chain ID " + CHAIN_ID}<br />
                {!CONTRACT_ADDRESS && <span style={{ color: "#dc2626" }}>Contrato no configurado. Edita CONTRACT_ADDRESS en App.jsx</span>}
              </div>
              <button style={estilos.btn()} onClick={conectarWallet} disabled={cargando}>
                {cargando ? "Conectando..." : "Conectar MetaMask"}
              </button>
            </>
          ) : (
            <div>
              <div style={{ fontSize: "13px", color: "#64748b", wordBreak: "break-all" }}>
                <strong>Wallet:</strong> {cuenta}
              </div>
              <div style={{ marginTop: "8px" }}>
                <span style={estilos.badge(esProfesor ? "#7c3aed" : "#0891b2")}>
                  {esProfesor ? "Profesor" : "Estudiante"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* VISTA PROFESOR */}
        {cuenta && esProfesor && (
          <div style={estilos.card}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: "0 0 16px 0" }}>
              Panel del Profesor
            </h2>

            <div>
              <label style={estilos.label}>ID de Clase (numero)</label>
              <input style={estilos.input} type="number" placeholder="Ej: 1" value={claseId} onChange={e => setClaseId(e.target.value)} />
              <label style={{ ...estilos.label, display: "block", marginTop: "10px" }}>Nombre de la Clase</label>
              <input style={estilos.input} type="text" placeholder="Ej: Matematicas - Lunes 10am" value={claseNombre} onChange={e => setClaseNombre(e.target.value)} />
              <button style={estilos.btn("#7c3aed")} onClick={crearClase} disabled={cargando}>
                {cargando ? "Procesando..." : "Crear Clase y Generar QR"}
              </button>
            </div>

            {qrData && (
              <div style={estilos.qrBox}>
                <p style={{ margin: 0, fontWeight: "600", color: "#1e293b" }}>QR para escanear</p>
                <QRCodeSVG value={qrData} size={220} level="H" includeMargin />
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                  Muestra este QR a los estudiantes para que marquen su asistencia
                </p>
              </div>
            )}

            {clasesCreadas.length > 0 && (
              <div style={estilos.seccion}>
                <p style={{ ...estilos.label, display: "block", marginBottom: "8px" }}>Clases creadas esta sesion:</p>
                {clasesCreadas.map((c, i) => (
                  <div key={i} style={estilos.claseItem}>
                    <span><strong>ID {c.id}</strong> — {c.nombre}</span>
                    <button
                      onClick={() => mostrarQr(c)}
                      style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", cursor: "pointer" }}
                    >
                      Ver QR
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA ESTUDIANTE */}
        {cuenta && !esProfesor && (
          <div style={estilos.card}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: "0 0 16px 0" }}>
              Panel del Estudiante
            </h2>

            {/* Registrar nombre */}
            {!nombreUsuario ? (
              <div style={{ background: "#fef3c7", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
                <p style={{ margin: "0 0 12px 0", fontWeight: "600", color: "#92400e", fontSize: "14px" }}>
                  Paso 1: Registra tu nombre en blockchain (solo una vez)
                </p>
                <input
                  style={estilos.input}
                  type="text"
                  placeholder="Tu nombre completo"
                  value={inputNombre}
                  onChange={e => setInputNombre(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && registrarNombre()}
                />
                <button style={estilos.btn("#f59e0b")} onClick={registrarNombre} disabled={cargando}>
                  {cargando ? "Registrando..." : "Registrar Nombre"}
                </button>
              </div>
            ) : (
              <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
                <p style={{ margin: 0, color: "#166534", fontWeight: "600", fontSize: "14px" }}>
                  Registrado como: {nombreUsuario}
                </p>
              </div>
            )}

            {/* Escanear QR */}
            {nombreUsuario && (
              <div style={estilos.seccion}>
                <p style={{ ...estilos.label, display: "block", marginBottom: "12px" }}>
                  Paso 2: Escanea el QR del profesor
                </p>

                {!escaneando && !claseEscaneada && (
                  <button style={estilos.btn("#0891b2")} onClick={() => setEscaneando(true)}>
                    Abrir Camara y Escanear QR
                  </button>
                )}

                {escaneando && (
                  <div>
                    <div id="qr-reader" ref={scannerRef} style={{ width: "100%" }}></div>
                    <button
                      style={estilos.btn("#64748b")}
                      onClick={() => setEscaneando(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {claseEscaneada && (
                  <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "16px", marginTop: "12px" }}>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "700", color: "#166534" }}>QR Escaneado</p>
                    <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#15803d" }}>
                      Clase: <strong>{claseEscaneada.clase}</strong> (ID: {claseEscaneada.claseId})
                    </p>
                    <div style={estilos.row}>
                      <button
                        style={{ ...estilos.btn("#16a34a"), marginTop: 0 }}
                        onClick={marcarAsistencia}
                        disabled={cargando}
                      >
                        {cargando ? "Marcando..." : "Confirmar Asistencia"}
                      </button>
                      <button
                        style={{ ...estilos.btn("#64748b"), marginTop: 0 }}
                        onClick={() => setClaseEscaneada(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
          Red: {CHAIN_NAMES[CHAIN_ID] || "Chain ID " + CHAIN_ID} &nbsp;|&nbsp; Contrato: {CONTRACT_ADDRESS ? CONTRACT_ADDRESS.slice(0, 10) + "..." : "No configurado"}
        </div>
      </div>
    </div>
  );
}
