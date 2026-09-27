import {
  NextResponse,
} from "next/server";


export const MAX_API_JSON_BYTES =
  2 * 1024 * 1024;


type ParsedJson =
  ReturnType<
    typeof JSON.parse
  >;


type ApiJsonResult =
  | {
      ok: true;
      value: ParsedJson;
    }
  | {
      ok: false;
      response: NextResponse;
    };


function jsonError(
  error: string,
  status: number
): ApiJsonResult {

  return {
    ok: false,
    response:
      NextResponse.json(
        {
          error,
        },
        {
          status,
          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      ),
  };
}


export async function readApiJsonBody(
  request: Request,
  maxBytes =
    MAX_API_JSON_BYTES
): Promise<ApiJsonResult> {

  const contentType =
    request.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();


  if (
    contentType !==
    "application/json"
  ) {
    return jsonError(
      "Content-Type must be application/json.",
      415
    );
  }


  const contentLengthRaw =
    request.headers.get(
      "content-length"
    );


  if (
    contentLengthRaw !==
    null
  ) {

    const normalizedLength =
      contentLengthRaw.trim();


    if (
      !/^\d+$/.test(
        normalizedLength
      )
    ) {
      return jsonError(
        "Invalid Content-Length header.",
        400
      );
    }


    const contentLength =
      Number(
        normalizedLength
      );


    if (
      !Number.isSafeInteger(
        contentLength
      )
    ) {
      return jsonError(
        "Invalid Content-Length header.",
        400
      );
    }


    if (
      contentLength >
      maxBytes
    ) {
      return jsonError(
        "Request body is too large.",
        413
      );
    }
  }


  if (!request.body) {
    return jsonError(
      "Request body must contain a JSON object.",
      400
    );
  }


  const reader =
    request.body.getReader();

  const chunks:
    Uint8Array[] = [];

  let totalBytes =
    0;


  try {

    while (true) {

      const {
        done,
        value,
      } =
        await reader.read();


      if (done) {
        break;
      }


      if (!value) {
        continue;
      }


      totalBytes +=
        value.byteLength;


      if (
        totalBytes >
        maxBytes
      ) {

        await reader.cancel();

        return jsonError(
          "Request body is too large.",
          413
        );
      }


      chunks.push(
        value
      );
    }

  } catch {

    return jsonError(
      "Request body could not be read.",
      400
    );
  }


  const bytes =
    new Uint8Array(
      totalBytes
    );

  let offset =
    0;


  for (
    const chunk of chunks
  ) {

    bytes.set(
      chunk,
      offset
    );

    offset +=
      chunk.byteLength;
  }


  let text: string;


  try {

    text =
      new TextDecoder(
        "utf-8",
        {
          fatal: true,
        }
      ).decode(
        bytes
      );

  } catch {

    return jsonError(
      "Request body must use valid UTF-8.",
      400
    );
  }


  let value:
    ParsedJson;


  try {

    value =
      JSON.parse(
        text
      );

  } catch {

    return jsonError(
      "Request body must contain valid JSON.",
      400
    );
  }


  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value
    )
  ) {
    return jsonError(
      "Request body must contain a JSON object.",
      400
    );
  }


  return {
    ok: true,
    value,
  };
}
