const toBase64Url = (value) =>
  btoa(String.fromCharCode(...new Uint8Array(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (value) => {
  const padding = "=".repeat((4 - (value.length % 4 || 4)) % 4);
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/") + padding;
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const decodeBase64Url = (value) => fromBase64Url(value).buffer;

const encodeCredentialDescriptor = (descriptor) => ({
  ...descriptor,
  id: decodeBase64Url(descriptor.id),
});

export function toPublicKeyCreationOptions(options) {
  return {
    ...options,
    challenge: decodeBase64Url(options.challenge),
    user: {
      ...options.user,
      id: decodeBase64Url(options.user.id),
    },
    excludeCredentials: (options.excludeCredentials || []).map(encodeCredentialDescriptor),
  };
}

export function toPublicKeyRequestOptions(options) {
  return {
    ...options,
    challenge: decodeBase64Url(options.challenge),
    allowCredentials: (options.allowCredentials || []).map(encodeCredentialDescriptor),
  };
}

const encodeClientExtensionResults = (value) => value || {};

export function serializeRegistrationResponse(credential) {
  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: toBase64Url(credential.response.clientDataJSON),
      attestationObject: toBase64Url(credential.response.attestationObject),
      transports: credential.response.getTransports ? credential.response.getTransports() : [],
    },
    clientExtensionResults: encodeClientExtensionResults(credential.getClientExtensionResults()),
    authenticatorAttachment: credential.authenticatorAttachment || null,
  };
}

export function serializeAuthenticationResponse(credential) {
  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: toBase64Url(credential.response.clientDataJSON),
      authenticatorData: toBase64Url(credential.response.authenticatorData),
      signature: toBase64Url(credential.response.signature),
      userHandle: credential.response.userHandle ? toBase64Url(credential.response.userHandle) : null,
    },
    clientExtensionResults: encodeClientExtensionResults(credential.getClientExtensionResults()),
    authenticatorAttachment: credential.authenticatorAttachment || null,
  };
}
