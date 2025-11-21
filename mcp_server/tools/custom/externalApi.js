/**
 * Generic external API caller tool for MCP server.
 *
 * Reads the API key from `EXTERNAL_API_KEY` environment variable.
 * Parameters:
 *  - url (string, required): full URL to request
 *  - method (string, optional): HTTP method, default `GET`
 *  - headers (object, optional): additional headers to send
 *  - body (object, optional): JSON body for POST/PUT/PATCH
 *
 * The tool will automatically add an `Authorization: Bearer <EXTERNAL_API_KEY>`
 * header if `Authorization` is not provided in `headers` and `EXTERNAL_API_KEY` is set.
 */

const executeFunction = async ({ url, method = "GET", headers = {}, body } = {}) => {
  const apiKey = process.env.EXTERNAL_API_KEY;

  if (!url) {
    return { error: "Missing required parameter: url" };
  }

  try {
    const requestHeaders = new Headers(headers || {});

    if (apiKey && !requestHeaders.has("Authorization")) {
      requestHeaders.set("Authorization", `Bearer ${apiKey}`);
    }

    // If user provided a body, assume JSON
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: requestHeaders,
    };

    if (body !== undefined && body !== null) {
      if (!requestHeaders.has("Content-Type")) {
        requestHeaders.set("Content-Type", "application/json");
      }
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(url, fetchOptions);

    const contentType = res.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      return {
        error: `Request failed with status ${res.status}`,
        status: res.status,
        body: data,
      };
    }

    return { status: res.status, body: data };
  } catch (err) {
    console.error("externalApi tool error:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "call_external_api",
      description:
        "Call an external HTTP API with an API key taken from EXTERNAL_API_KEY environment variable.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Full URL to call" },
          method: { type: "string", description: "HTTP method (GET, POST, etc.)" },
          headers: {
            type: "object",
            description: "Optional additional headers as key/value pairs",
            additionalProperties: { type: "string" },
          },
          body: { type: ["object", "string", "number", "array", "null"], description: "Request body (JSON)" },
        },
        required: ["url"],
      },
    },
  },
};

export { apiTool };
