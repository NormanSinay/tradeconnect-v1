// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Certificate Registry Smart Contract
 * @dev Contrato inteligente para registro inmutable de certificados en blockchain
 * @author TradeConnect Team
 * @version 1.0.0
 */
contract CertificateRegistry {

    // Estructura para almacenar información del certificado
    struct CertificateRecord {
        string hash;                    // Hash SHA-256 del certificado
        uint256 entityId;              // ID de la entidad en la base de datos
        string entityType;             // Tipo de entidad (certificate, qr_code, etc.)
        address registrar;             // Dirección que registró el hash
        uint256 timestamp;             // Timestamp del registro
        string metadata;               // Metadatos adicionales en JSON
        bool isActive;                 // Si el registro está activo
    }

    // Mapping de hash a registro de certificado
    mapping(string => CertificateRecord) private certificateRecords;

    // Mapping para verificar si un hash ya fue registrado
    mapping(string => bool) private registeredHashes;

    // Array para mantener lista de todos los hashes registrados
    string[] private allHashes;

    // Eventos
    event CertificateRegistered(
        string indexed hash,
        uint256 indexed entityId,
        string indexed entityType,
        address registrar,
        uint256 timestamp
    );

    event CertificateRevoked(
        string indexed hash,
        address revoker,
        uint256 timestamp
    );

    // Modificadores
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier hashNotRegistered(string memory hash) {
        require(!registeredHashes[hash], "Hash already registered");
        _;
    }

    modifier hashExists(string memory hash) {
        require(registeredHashes[hash], "Hash not registered");
        _;
    }

    // Variables de estado
    address public owner;
    uint256 public totalCertificates;
    bool public paused;

    constructor() {
        owner = msg.sender;
        totalCertificates = 0;
        paused = false;
    }

    /**
     * @dev Registra un nuevo hash de certificado
     * @param hash Hash SHA-256 del certificado
     * @param entityId ID de la entidad en la base de datos
     * @param entityType Tipo de entidad
     * @param metadata Metadatos adicionales en formato JSON
     */
    function registerCertificate(
        string memory hash,
        uint256 entityId,
        string memory entityType,
        string memory metadata
    ) public hashNotRegistered(hash) {
        require(!paused, "Contract is paused");
        require(bytes(hash).length == 64, "Invalid hash length");
        require(bytes(entityType).length > 0, "Entity type cannot be empty");

        // Crear registro
        CertificateRecord memory newRecord = CertificateRecord({
            hash: hash,
            entityId: entityId,
            entityType: entityType,
            registrar: msg.sender,
            timestamp: block.timestamp,
            metadata: metadata,
            isActive: true
        });

        // Almacenar registro
        certificateRecords[hash] = newRecord;
        registeredHashes[hash] = true;
        allHashes.push(hash);
        totalCertificates++;

        // Emitir evento
        emit CertificateRegistered(hash, entityId, entityType, msg.sender, block.timestamp);
    }

    /**
     * @dev Verifica si un hash está registrado
     * @param hash Hash a verificar
     * @return exists Si el hash existe
     * @return entityId ID de la entidad
     * @return entityType Tipo de entidad
     * @return registrar Dirección que registró
     * @return timestamp Timestamp del registro
     * @return isActive Si está activo
     */
    function verifyCertificate(string memory hash)
        public
        view
        returns (
            bool exists,
            uint256 entityId,
            string memory entityType,
            address registrar,
            uint256 timestamp,
            bool isActive
        )
    {
        if (!registeredHashes[hash]) {
            return (false, 0, "", address(0), 0, false);
        }

        CertificateRecord memory record = certificateRecords[hash];
        return (
            true,
            record.entityId,
            record.entityType,
            record.registrar,
            record.timestamp,
            record.isActive
        );
    }

    /**
     * @dev Obtiene los metadatos de un certificado
     * @param hash Hash del certificado
     * @return metadata Metadatos en JSON
     */
    function getCertificateMetadata(string memory hash)
        public
        view
        hashExists(hash)
        returns (string memory metadata)
    {
        return certificateRecords[hash].metadata;
    }

    /**
     * @dev Revoca un certificado (solo owner)
     * @param hash Hash del certificado a revocar
     */
    function revokeCertificate(string memory hash)
        public
        onlyOwner
        hashExists(hash)
    {
        certificateRecords[hash].isActive = false;
        emit CertificateRevoked(hash, msg.sender, block.timestamp);
    }

    /**
     * @dev Reactiva un certificado revocado (solo owner)
     * @param hash Hash del certificado a reactivar
     */
    function reactivateCertificate(string memory hash)
        public
        onlyOwner
        hashExists(hash)
    {
        certificateRecords[hash].isActive = true;
    }

    /**
     * @dev Obtiene el total de certificados registrados
     * @return count Número total de certificados
     */
    function getTotalCertificates() public view returns (uint256 count) {
        return totalCertificates;
    }

    /**
     * @dev Obtiene todos los hashes registrados (paginado)
     * @param offset Offset para paginación
     * @param limit Límite de resultados
     * @return hashes Array de hashes
     */
    function getRegisteredHashes(uint256 offset, uint256 limit)
        public
        view
        returns (string[] memory hashes)
    {
        require(offset < allHashes.length, "Offset out of bounds");

        uint256 actualLimit = limit;
        if (offset + limit > allHashes.length) {
            actualLimit = allHashes.length - offset;
        }

        string[] memory result = new string[](actualLimit);
        for (uint256 i = 0; i < actualLimit; i++) {
            result[i] = allHashes[offset + i];
        }

        return result;
    }

    /**
     * @dev Verifica si un hash pertenece a una entidad específica
     * @param hash Hash a verificar
     * @param entityId ID de entidad esperado
     * @param entityType Tipo de entidad esperado
     * @return isValid Si la verificación es válida
     */
    function verifyEntityOwnership(
        string memory hash,
        uint256 entityId,
        string memory entityType
    ) public view returns (bool isValid) {
        if (!registeredHashes[hash]) {
            return false;
        }

        CertificateRecord memory record = certificateRecords[hash];
        return record.entityId == entityId &&
               keccak256(bytes(record.entityType)) == keccak256(bytes(entityType)) &&
               record.isActive;
    }

    /**
     * @dev Pausa el contrato (solo owner)
     */
    function pause() public onlyOwner {
        paused = true;
    }

    /**
     * @dev Reanuda el contrato (solo owner)
     */
    function unpause() public onlyOwner {
        paused = false;
    }

    /**
     * @dev Transfiere ownership (solo owner)
     * @param newOwner Nueva dirección owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }

    /**
     * @dev Función fallback para rechazar pagos accidentales
     */
    receive() external payable {
        revert("This contract does not accept payments");
    }

    /**
     * @dev Función fallback para rechazar llamadas no reconocidas
     */
    fallback() external {
        revert("Function not found");
    }
}