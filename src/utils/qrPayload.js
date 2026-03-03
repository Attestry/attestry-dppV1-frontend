const NULL_LIKE = new Set(["", "null", "undefined"]);

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch (_) {
    return value;
  }
};

const stripDecorators = (value) => {
  const trimmed = value.trim();
  const qIndex = trimmed.indexOf("?");
  const noQuery = qIndex >= 0 ? trimmed.substring(0, qIndex) : trimmed;
  const hashIndex = noQuery.indexOf("#");
  return hashIndex >= 0 ? noQuery.substring(0, hashIndex) : noQuery;
};

export const extractPublicPassportCode = (rawPayload) => {
  const decoded = safeDecode(rawPayload || "").trim();
  if (!decoded) return "";

  let candidate = decoded;
  const routeIndex = decoded.indexOf("/p/");
  if (routeIndex >= 0) {
    candidate = decoded.substring(routeIndex + 3);
  }

  candidate = stripDecorators(candidate);
  const slashIndex = candidate.indexOf("/");
  if (slashIndex >= 0) {
    candidate = candidate.substring(0, slashIndex);
  }

  return candidate.trim();
};

export const extractTransferCredential = (rawPayload) => {
  const decoded = safeDecode(rawPayload || "").trim();
  if (!decoded) {
    return { tokenOrCode: "" };
  }

  let token = "";
  let code = "";

  try {
    const url = new URL(decoded);
    token = (url.searchParams.get("t") || "").trim();
    code = (url.searchParams.get("c") || "").trim();
    if (!token && url.pathname.includes("/transfer/")) {
      token = url.pathname.split("/transfer/").pop()?.trim() || "";
    }
  } catch (_) {
    const tMatch = decoded.match(/[?&]t=([^&#]+)/);
    const cMatch = decoded.match(/[?&]c=([^&#]+)/);
    token = tMatch ? safeDecode(tMatch[1]).trim() : "";
    code = cMatch ? safeDecode(cMatch[1]).trim() : "";
  }

  if (!token && !code) {
    if (decoded.startsWith("OTC-")) {
      code = decoded.substring(4).trim();
    } else {
      const direct = stripDecorators(decoded);
      if (direct.startsWith("tr_")) token = direct;
      else code = direct;
    }
  }

  const normalizedCode = code.trim();
  const tokenOrCode = !NULL_LIKE.has(normalizedCode.toLowerCase()) ? normalizedCode : token.trim();

  return {
    tokenOrCode,
    transferToken: token.trim(),
    oneTimeCode: normalizedCode
  };
};

export const buildTransferAcceptUrl = (origin, transferToken, code) => {
  const base = `${origin}/transfer/accept?t=${encodeURIComponent(transferToken)}`;
  const normalizedCode = (code || "").trim();
  if (!normalizedCode) {
    return base;
  }
  return `${base}&c=${encodeURIComponent(normalizedCode)}`;
};
