import Image from "next/image";
import { UserRound } from "lucide-react";

/** Shared account appearance while restoring auth, signed out, and signed in. */
export default function AccountAvatar({
  src,
  name = "",
}: {
  src?: string;
  name?: string;
}) {
  return (
    <span className="hover:ring-brand-primary relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-dm-text-secondary ring-2 ring-brand-light transition-colors">
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="36px"
          className="object-cover"
        />
      ) : (
        <UserRound size={22} aria-hidden="true" />
      )}
    </span>
  );
}
