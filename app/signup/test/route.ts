import { formSchema } from "@/lib/formSchema";
import arcjet, { protectSignup } from "@/lib/arcjet";
import { NextResponse } from "next/server";

// Add rules to the base Arcjet instance outside of the handler function
const aj = arcjet.withRule(
  // Arcjet's protectSignup rule is a combination of email validation, bot
  // protection and rate limiting. Each of these can also be used separately
  // on other routes e.g. rate limiting on a login route. See
  // https://docs.arcjet.com/get-started
  protectSignup({
    email: {
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // Block emails that are disposable, invalid, or have no MX records
      block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    },
    bots: {
      mode: "LIVE",
      // Block clients that we are sure are automated
      allow: [],
    },
    // It would be unusual for a form to be submitted more than 5 times in 10
    // minutes from the same IP address
    rateLimit: {
      // uses a sliding window rate limit
      mode: "LIVE",
      interval: "2m", // counts requests over a 10 minute sliding window
      max: 5, // allows 5 submissions within the window
    },
  }),
);

export async function POST(req: Request) {
  const json = await req.json();
  const data = formSchema.safeParse(json);

  if (!data.success) {
    const { error } = data;

    return NextResponse.json(
      { message: "Invalid request", error },
      { status: 400 },
    );
  }

  const { email } = data.data;

  const decision = await aj.protect(req, { email });

  console.log("Arcjet decision: ", decision);

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      let message: string;

      // These are specific errors to help the user, but will also reveal the
      // validation to a spammer.
      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "email address format is invalid. Is there a typo?";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "we do not allow disposable email addresses.";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message =
          "your email domain does not have an MX record. Is there a typo?";
      } else {
        // This is a catch all, but the above should be exhaustive based on the
        // configured rules.
        message = "invalid email.";
      }

      if (decision.ip.hasCountry()) {
        message += ` PS: Hello to you in ${decision.ip.countryName}!`;
      }

      return NextResponse.json(
        { message, reason: decision.reason },
        { status: 400 },
      );
    } else if (decision.reason.isRateLimit()) {
      const reset = decision.reason.resetTime;

      if (reset === undefined) {
        return NextResponse.json(
          {
            message: "Too many requests. Please try again later.",
            reason: decision.reason,
          },
          { status: 429 },
        );
      }

      // Calculate number of seconds between reset Date and now
      const seconds = Math.floor((reset.getTime() - Date.now()) / 1000);
      const minutes = Math.ceil(seconds / 60);

      if (minutes > 1) {
        return NextResponse.json(
          {
            message: `Too many requests. Please try again in ${minutes} minutes.`,
            reason: decision.reason,
          },
          { status: 429 },
        );
      } else {
        return NextResponse.json(
          {
            message: `Too many requests. Please try again in ${seconds} seconds.`,
            reason: decision.reason,
          },
          { status: 429 },
        );
      }
    } else {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({
    ok: true,
  });
}
