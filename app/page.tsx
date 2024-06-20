import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Arcjet + Fly.io example app
        </h1>
        <p className="max-w-[700px]">
          <Link
            href="https://arcjet.com"
            target="_blank"
            className="hover:underline font-bold decoration-1 underline-offset-2"
          >
            Arcjet
          </Link>{" "}
          helps developers protect their apps in just a few lines of code.
          Implement rate limiting, bot protection, email verification & defend
          against common attacks.
        </p>
        <p className="max-w-[700px]">
          This application shows of the key features of Arcjet. The code is{" "}
          <Link
            href="https://github.com/arcjet/arcjet-js-example"
            target="_blank"
            rel="noreferrer"
            className="hover:underline font-bold decoration-1 underline-offset-2"
          >
            on GitHub
          </Link>
          .
        </p>
      </div>
      <h2 className="text-xl font-bold">Examples</h2>
      <div className="flex gap-4">
        <Link href="/signup" className={buttonVariants({ variant: "default" })}>
          Signup form protection
        </Link>
        <Link href="/bots" className={buttonVariants({ variant: "default" })}>
          Bot protection
        </Link>
        <Link
          href="/rate-limiting"
          className={buttonVariants({ variant: "default" })}
        >
          Rate limiting
        </Link>
        <Link href="/attack" className={buttonVariants({ variant: "default" })}>
          Attack protection
        </Link>
      </div>

      <h2 className="text-xl font-bold">What next?</h2>
      <div className="flex gap-4">
        <Link
          href="https://app.arcjet.com"
          target="_blank"
          className={buttonVariants({ variant: "outline" })}
        >
          Sign up for Arcjet
        </Link>
        <Link
          href="https://docs.arcjet.com"
          target="_blank"
          className={buttonVariants({ variant: "outline" })}
        >
          Arcjet docs
        </Link>
        <Link
          href="https://discord.gg/TPra6jqZDC"
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "outline" })}
        >
          Join our Discord
        </Link>
      </div>
    </section>
  );
}
