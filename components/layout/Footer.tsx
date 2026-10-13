/**
 * Footer Component
 *
 * Site footer with:
 * - Navigation links
 * - Social media icons
 * - Payment method icons
 * - Legal disclaimers
 */

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

// Social Icons
import { BiLogoFacebook } from "react-icons/bi";
import { BsDiscord, BsTwitterX, BsPaypal, BsTranslate } from "react-icons/bs";
import { IoLogoYoutube, IoLogoWechat } from "react-icons/io5";
import { FaInstagram, FaAmazonPay } from "react-icons/fa";
import { FaMoneyBills, FaGooglePay } from "react-icons/fa6";
import { GrLocation } from "react-icons/gr";

// Payment Icons
import { RiVisaLine } from "react-icons/ri";
import {
  SiMastercard,
  SiFampay,
  SiPaytm,
  SiSamsungpay,
  SiAfterpay,
  SiPayloadcms,
} from "react-icons/si";
import { AiOutlineAlipay } from "react-icons/ai";
import { TbBrandPaypay } from "react-icons/tb";
import { PiContactlessPaymentFill } from "react-icons/pi";

/* ============================================
   CONSTANTS
   ============================================ */

/** Footer navigation sections */
const getFooterSections = (t: any) => [
  {
    title: t("difmarkTitle"),
    links: [
      { label: t("aboutUs"), href: "/about" },
      { label: t("careers"), href: "/careers" },
      { label: t("press"), href: "/press" },
      { label: t("blog"), href: "/blog" },
      { label: t("contact"), href: "/contact" },
    ],
  },
  {
    title: t("supportTitle"),
    links: [
      { label: t("helpCenter"), href: "/help" },
      { label: t("faq"), href: "/faq" },
      { label: t("refundPolicy"), href: "/refund" },
      { label: t("termsOfService"), href: "/terms" },
      { label: t("privacyPolicy"), href: "/privacy" },
    ],
  },
  {
    title: t("categoriesTitle"),
    links: [
      { label: t("steamGames"), href: "/games/steam" },
      { label: t("xboxGames"), href: "/games/xbox" },
      { label: t("playStation"), href: "/games/playstation" },
      { label: t("giftCards"), href: "/gift-cards" },
      { label: t("software"), href: "/software" },
    ],
  },
] as const;

/** Social media links */
const SOCIAL_LINKS = [
  { icon: BsDiscord, label: "Discord", href: "https://discord.com" },
  { icon: IoLogoYoutube, label: "YouTube", href: "https://youtube.com" },
  { icon: BsTwitterX, label: "Twitter", href: "https://twitter.com" },
  { icon: BiLogoFacebook, label: "Facebook", href: "https://facebook.com" },
  { icon: FaInstagram, label: "Instagram", href: "https://instagram.com" },
] as const;

/** Payment methods */
const getPaymentMethods = (t: any) => [
  { icon: RiVisaLine, label: "Visa", size: 48 },
  { icon: SiMastercard, label: "Mastercard", size: 34 },
  { icon: IoLogoWechat, label: "WeChat Pay", size: 28 },
  { icon: FaGooglePay, label: "Google Pay", size: 34 },
  { icon: FaAmazonPay, label: "Amazon Pay", size: 34 },
  { icon: SiFampay, label: "FamPay", size: 24 },
  { icon: BsPaypal, label: "PayPal", size: 24 },
  { icon: AiOutlineAlipay, label: "Alipay", size: 24 },
  { icon: SiPaytm, label: "Paytm", size: 30 },
  { icon: TbBrandPaypay, label: "PayPay", size: 28 },
  { icon: SiSamsungpay, label: "Samsung Pay", size: 32 },
  { icon: PiContactlessPaymentFill, label: "Contactless", size: 28 },
  { icon: SiAfterpay, label: "Afterpay", size: 28 },
  { icon: SiPayloadcms, label: t("otherPayment"), size: 28 },
] as const;


/* ============================================
   SUB-COMPONENTS
   ============================================ */

/**
 * Footer section with title and links
 */
interface FooterSectionProps {
  title: string;
  links: readonly { label: string; href: string }[];
}

function FooterSection({ title, links }: FooterSectionProps) {
  const t = useTranslations("common");
  return (
    <div className="flex flex-col gap-y-5">
      <h3 className="text-[16px] font-bold mb-2 text-dm-text-primary">
        {title}
      </h3>
      <nav aria-label={`${title} ${t("navigation")}`}>
        <ul className="flex flex-col gap-y-5">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                prefetch={false}
                href={link.href}
                className="text-[14px] text-dm-text-secondary hover:text-dm-text-primary transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/**
 * Social media icon button
 */
interface SocialIconProps {
  icon: React.ElementType;
  label: string;
  href: string;
}

function SocialIcon({ icon: Icon, label, href }: SocialIconProps) {
  const t = useTranslations("common");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="h-8 w-8 flex items-center justify-center rounded-sm bg-surface-overlay text-dm-text-muted hover:text-dm-text-primary hover:bg-state-hover transition-colors"
      aria-label={`${t("followUsOn")} ${label}`}
    >
      <Icon size={24} aria-hidden="true" />
    </a>
  );
}

/**
 * Payment method icon
 */
interface PaymentIconProps {
  icon: React.ElementType;
  label: string;
  size: number;
}

function PaymentIcon({ icon: Icon, label, size }: PaymentIconProps) {
  return (
    <div
      className="h-10 1920:w-[100px] 1640:w-[80px] w-[68px] flex items-center justify-center rounded-sm bg-surface-overlay text-dm-text-muted"
      title={label}
    >
      <Icon size={size} aria-hidden="true" />
    </div>
  );
}

/**
 * Horizontal divider
 */
function Divider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px bg-dm-border-subtle ${className}`}
      aria-hidden="true"
    />
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * Footer Component
 */
export default function Footer() {
  const t = useTranslations("common");
  return (
    <footer className="bg-[#11151a] 800:px-0 px-8 w-full flex justify-center">
      <div className="max-w-[720px] 990:max-w-[940px] 1200:max-w-[1140px] 1640:max-w-[1310px] 1920:max-w-[1590px] w-full py-8">
        {/* Top Section: Links & Social */}
        <div className="1025:flex-row flex-col flex mb-8 justify-between">
          {/* Navigation Links */}
          <div className="flex justify-between 1025:justify-normal 1025:gap-x-20 1200:gap-x-40">
            {getFooterSections(t).map((section) => (
              <FooterSection
                key={section.title}
                title={section.title}
                links={section.links}
              />
            ))}
          </div>

          {/* Mobile Divider */}
          <Divider className="1025:hidden block my-8" />

          {/* Social & Settings */}
          <div className="flex text-dm-text-muted justify-between 1025:justify-normal flex-col 800:flex-row 1025:flex-col gap-y-24">
            {/* Social Icons */}
            <div className="flex gap-x-7">
              {SOCIAL_LINKS.map((social) => (
                <SocialIcon
                  key={social.label}
                  icon={social.icon}
                  label={social.label}
                  href={social.href}
                />
              ))}
            </div>

            {/* Location, Currency, Language */}
            <div className="flex gap-x-8">
              <div className="flex gap-x-2 items-center">
                <GrLocation size={22} aria-hidden="true" />
                <span>{t("asia")}</span>
              </div>

              <div className="flex gap-x-2 items-center">
                <div className="h-7 w-[0.5px] bg-dm-border-subtle" />
                <FaMoneyBills size={22} aria-hidden="true" />
                <span>{t("usd")}</span>
              </div>

              <div className="flex gap-x-2 items-center">
                <div className="h-7 w-[0.5px] bg-dm-border-subtle" />
                <BsTranslate size={22} aria-hidden="true" />
                <span>{t("en")}</span>
              </div>
            </div>
          </div>
        </div>

        <Divider className="mb-3" />

        {/* Payment Methods */}
        <div
          className="1200:flex hidden items-center gap-x-4"
          aria-label={t("acceptedPaymentMethods")}
        >
          {getPaymentMethods(t).map((payment) => (
            <PaymentIcon
              key={payment.label}
              icon={payment.icon}
              label={payment.label}
              size={payment.size}
            />
          ))}
        </div>

        <Divider className="mt-3" />

        {/* Bottom Section: Disclaimer & Copyright */}
        <div className="w-full mt-5 flex justify-between">
          {/* Disclaimer */}
          <div className="text-dm-text-secondary max-w-[310px] text-[14px] font-semibold">
            {t("disclaimer")}{" "}
            <span className="text-[12px] font-normal">
              {t("disclaimerText")}
            </span>
          </div>

          {/* Copyright */}
          <div className="text-[12px] text-dm-text-primary max-w-[324px] text-right">
            {t("acceptingMoreThan300PaymentMethods")}
            <br />
            {t("technicalPlatformProvidedBy")}&nbsp;
            <Link prefetch={false} href="/" className="hover:underline">
              {t("difmark")}
            </Link>
            &nbsp;2025
          </div>
        </div>
      </div>
    </footer>
  );
}
