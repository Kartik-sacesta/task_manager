const crypto = require("crypto");
const fs = require("fs");

function aes() {
  console.log(
    "----------------------------------------------------AES---------------------------------------------"
  );

  const DATA_FILE = "firbaseapp.json";
  const ENCRYPTED_FILE = "encrypted.bin";
  const KEY_FILE = "aeskey.bin";
  const DECRYPTED_FILE = "decrypted.json";

  function encryptFile() {
    const jsonData = fs.readFileSync(DATA_FILE, "utf8");
    const jsonBuffer = Buffer.from(jsonData, "utf8");

    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const encrypted = Buffer.concat([
      cipher.update(jsonBuffer),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    const output = Buffer.concat([iv, authTag, encrypted]);

    fs.writeFileSync(ENCRYPTED_FILE, output);
    fs.writeFileSync(KEY_FILE, key);

    console.log("encrypt------>", output);

    console.log(
      `Encryption complete.\nKey saved to ${KEY_FILE}.\nEncrypted data saved to ${ENCRYPTED_FILE}.`
    );
  }

  function decryptFile() {
    const key = fs.readFileSync(KEY_FILE);
    const input = fs.readFileSync(ENCRYPTED_FILE);

    const iv = input.slice(0, 12);
    const authTag = input.slice(12, 28);
    const encrypted = input.slice(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    const jsonText = decrypted.toString("utf8");

    fs.writeFileSync(DECRYPTED_FILE, jsonText);
    console.log(
      `Decryption complete. Decrypted JSON saved to ${DECRYPTED_FILE}.\nContent:`
    );
    console.log(jsonText);
  }

  encryptFile();
  decryptFile();
}

function Rsa() {
  console.log(
    "-------------------------------------------RSA----------------------------------------------"
  );
  const PUB_KEY_FILE = "rsa_pub.pem";
  const PRIV_KEY_FILE = "rsa_priv.pem";

  function generateKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "pkcs1", format: "pem" },
      privateKeyEncoding: { type: "pkcs1", format: "pem" },
    });

    fs.writeFileSync(PUB_KEY_FILE, publicKey);
    fs.writeFileSync(PRIV_KEY_FILE, privateKey);

    console.log(`RSA Keypair generated:
  - Public Key:  ${PUB_KEY_FILE}
  - Private Key: ${PRIV_KEY_FILE}`);
  }

  function encryptWithPublicKey(plainText) {
    const pubKey = fs.readFileSync(PUB_KEY_FILE, "utf8");
    const data = Buffer.from(plainText, "utf8");
    const encryptedBuffer = crypto.publicEncrypt(pubKey, data);

    return encryptedBuffer.toString("hex");
  }

  function decryptWithPrivateKey(encryptedBase64) {
    const privKey = fs.readFileSync(PRIV_KEY_FILE, "utf8");
    const decryptedBuffer = crypto.privateDecrypt(
      privKey,
      Buffer.from(encryptedBase64, "hex")
    );
    return decryptedBuffer.toString("utf8");
  }

  const MESSAGE = "This is secure!";
  if (!fs.existsSync(PUB_KEY_FILE) || !fs.existsSync(PRIV_KEY_FILE)) {
    generateKeys();
  }

  console.log("\nOriginal Message:", MESSAGE);
  const encrypted = encryptWithPublicKey(MESSAGE);
  console.log("\nEncrypted :", encrypted);

  const decrypted = decryptWithPrivateKey(encrypted);
  console.log("\nDecrypted:", decrypted);
}

aes();
Rsa();
