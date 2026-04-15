// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Asistencia {
    address public profesor;
    mapping(uint256 => mapping(address => bool)) public asistencias;
    mapping(uint256 => string) public nombreClases;
    mapping(address => string) public nombres;

    constructor() { profesor = msg.sender; }

    function registrarNombre(string memory nombre) external {
        require(bytes(nombres[msg.sender]).length == 0, "Ya registrado");
        nombres[msg.sender] = nombre;
    }

    function crearClase(uint256 claseId, string memory nombre) external {
        require(msg.sender == profesor, "Solo profesor");
        nombreClases[claseId] = nombre;
    }

    function marcarAsistencia(uint256 claseId) external {
        require(bytes(nombres[msg.sender]).length > 0, "Registra nombre primero");
        require(!asistencias[claseId][msg.sender], "Ya marcaste asistencia");
        asistencias[claseId][msg.sender] = true;
    }
}
