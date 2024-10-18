import arcjet, { shield } from "@/lib/arcjet";
import { NextRequest, NextResponse } from "next/server";

// Opt out of caching
export const dynamic = "force-dynamic";

// Add rules to the base Arcjet instance outside of the handler function
const aj = arcjet.withRule(
  // Shield detects suspicious behavior, such as SQL injection and cross-site
  // scripting attacks.
  shield({
    mode: "LIVE",
  }),
);

export async function GET(req: NextRequest) {
  // The protect method returns a decision object that contains information
  // about the request.
  const fingerprint = req.ip!;
  const decision = await aj.protect(req, { fingerprint });

  console.log("Arcjet decision: ", decision);

  // If the decision is denied, return a 403 Forbidden response. You can inspect
  // the decision results to customize the response.
  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (decision.isErrored()) {
    console.error("Arcjet error:", decision.reason);
    if (decision.reason.message == "[unauthenticated] invalid key") {
      return NextResponse.json(
        {
          message:
            "Invalid Arcjet key. Is the ARCJET_KEY environment variable set?",
        },
        { status: 500 },
      );
    } else {
      return NextResponse.json(
        { v: "Internal server error: " + decision.reason.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ message: "Hello world" });
}
