// utils/api.ts

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions extends RequestInit {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string> | Headers;
}

export async function fetchApi(
  endpoint: string,
  options: RequestOptions | RequestInit = {}
) {
  const { method = "GET", body, headers = {}, ...otherOptions } = options;

  // Convert Headers object to plain object if needed
  let headersObject: Record<string, string> = {};

  if (headers instanceof Headers) {
    // Convert Headers object to plain object
    Array.from(headers.entries()).forEach(([key, value]) => {
      headersObject[key] = value;
    });
  } else {
    headersObject = headers as Record<string, string>;
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Merge headers properly
  const mergedHeaders = {
    ...defaultHeaders,
    ...headersObject,
  };

  // Create fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: mergedHeaders,
    ...otherOptions,
  };

  if (body) {
    if (typeof body === "string") {
      fetchOptions.body = body;
    } else if (method === "POST" || method === "PUT") {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  // Debug log to verify headers

  const response = await fetch(`/api/proxy${endpoint}`, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}
