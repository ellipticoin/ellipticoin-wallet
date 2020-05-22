const ethUtil = require("ethereumjs-util");
const ethUtil2 = require("ethjs-util");
const abi = require("ethereumjs-abi");
// const Buffer = require('buffer/').Buffer

const typedData = {
  types: {
    EIP712Domain: [{ name: "name", type: "string" }],
    Unlock: [
      { name: "action", type: "string" },
      { name: "ellipticoin_address", type: "string" },
    ],
  },
  primaryType: "Unlock",
  domain: {
    name: "Ellipticoin",
  },
  message: {
    action: "unlock",
    ellipticoin_address: "vQMn3JvS3ATITteQ-gOYfuVSn2buuAH-4e8NY_CvtwA",
  },
};

const types = typedData.types;

// Recursively finds all the dependencies of a type
function dependencies(primaryType, found = []) {
  if (found.includes(primaryType)) {
    return found;
  }
  if (types[primaryType] === undefined) {
    return found;
  }
  found.push(primaryType);
  for (let field of types[primaryType]) {
    for (let dep of dependencies(field.type, found)) {
      if (!found.includes(dep)) {
        found.push(dep);
      }
    }
  }
  return found;
}

function encodeType(primaryType) {
  // Get dependencies primary first, then alphabetical
  let deps = dependencies(primaryType);
  deps = deps.filter((t) => t != primaryType);
  deps = [primaryType].concat(deps.sort());

  // Format as a string with fields
  let result = "";
  for (let type of deps) {
    result += `${type}(${types[type]
      .map(({ name, type }) => `${type} ${name}`)
      .join(",")})`;
  }
  return result;
}

function typeHash(primaryType) {
  return ethUtil.keccak256(Buffer.from(encodeType(primaryType)));
}

function encodeData(primaryType, data) {
  let encTypes = [];
  let encValues = [];

  // Add typehash
  encTypes.push("bytes32");
  encValues.push(typeHash(primaryType));

  // Add field contents
  for (let field of types[primaryType]) {
    let value = data[field.name];
    if (field.type == "string" || field.type == "bytes") {
      encTypes.push("bytes32");
      value = ethUtil.keccak256(Buffer.from(value, "utf8"));
      encValues.push(value);
    } else if (types[field.type] !== undefined) {
      encTypes.push("bytes32");
      value = ethUtil.keccak256(encodeData(field.type, value));
      encValues.push(value);
    } else if (field.type.lastIndexOf("]") === field.type.length - 1) {
      throw "TODO: Arrays currently unimplemented in encodeData";
    } else {
      encTypes.push(field.type);
      encValues.push(value);
    }
  }

  return abi.rawEncode(encTypes, encValues);
}

function structHash(primaryType, data) {
  return ethUtil.keccak256(encodeData(primaryType, data));
}

function signHash() {
  return ethUtil.keccak256(
    Buffer.concat([
      Buffer.from("1901", "hex"),
      structHash("EIP712Domain", typedData.domain),
      structHash(typedData.primaryType, typedData.message),
    ])
  );
}
export function getSignature() {
  const privateKey = Buffer.from(process.env.REACT_APP_PRIVATE_KEY, "hex");
  console.log(signHash())
  const { r, s, v } = ethUtil.ecsign(signHash(), privateKey);
  console.log(
    "0x" + [r, s, v].map((b) => ethUtil.bufferToHex(b).substring(2)).join("")
  );
}
