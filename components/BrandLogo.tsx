import Image from "next/image";

type Props = {
  className?: string;
};

export default function BrandLogo({ className }: Props) {
  return (
    <span className={["relative inline-block", className].filter(Boolean).join(" ")}>
      <Image src="/g1.svg" alt="allium" fill className="allium-logo select-none object-contain" sizes="180px" draggable={false} priority />
    </span>
  );
}
