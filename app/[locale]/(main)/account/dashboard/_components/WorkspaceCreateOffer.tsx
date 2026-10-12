"use client";

import React from "react";
import { Archive, CheckCircle2, Upload, X } from "lucide-react";
import {
  cyberPanelClass,
  cyberInputClass,
  cyberTextareaClass,
  cyberPrimaryButtonClass,
  cyberGhostButtonClass,
  ProductImage,
} from "./SellerWorkspaceComponents";
import {
  productTypeOptions,
  platformOptions,
  deliveryOptions,
  regionOptions,
  imageOptions,
  type ListingFormState,
} from "./useSellerWorkspace";
import { useTranslations } from "next-intl";

/* ==========================================================================
   TYPE DEFINITIONS & INTERFACES
   ========================================================================== */

interface WorkspaceCreateOfferProps {
  form: ListingFormState;
  formError: string | null;
  isSaving: boolean;
  isUploading: boolean;
  updateFormField: (field: keyof ListingFormState, value: string) => void;
  handleUploadImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveListing: (status: "draft" | "published") => void;
}

/* ==========================================================================
   MAIN COMPONENT: WorkspaceCreateOffer
   ========================================================================== */

/**
 * WorkspaceCreateOffer Component
 *
 * Renders the input fields form for listing details (pricing, stocks, delivery)
 * alongside a live desktop card visualizer panel.
 */
export function WorkspaceCreateOffer({
  form,
  formError,
  isSaving,
  isUploading,
  updateFormField,
  handleUploadImage,
  handleSaveListing,
}: WorkspaceCreateOfferProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="grid max-h-none gap-5 overflow-visible xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
      
      {/* Left Column: Form input fields */}
      <div className={`${cyberPanelClass} min-w-0 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          
          {/* Product Title */}
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold text-gray-400">
              {t("productName")}
            </span>
            <input
              value={form.title}
              maxLength={200}
              onChange={(event) =>
                updateFormField("title", event.target.value)
              }
              className={cyberInputClass}
              placeholder="Example: Steam Gift Card $50"
            />
          </label>

          {/* Product Type dropdown */}
          <label className="space-y-2">
            <span className="text-xs font-bold text-gray-400">
              {t("productType")}
            </span>
            <select
              value={form.productType}
              onChange={(event) =>
                updateFormField("productType", event.target.value)
              }
              className={cyberInputClass}
            >
              {productTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {/* Platform selection dropdown */}
          <label className="space-y-2">
            <span className="text-xs font-bold text-gray-400">
              {t("platform")}
            </span>
            <select
              value={form.platform}
              onChange={(event) =>
                updateFormField("platform", event.target.value)
              }
              className={cyberInputClass}
            >
              {platformOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {/* Product Edition */}
          <label className="space-y-2">
            <span className="text-xs font-bold text-gray-400">
              {t("edition")}
            </span>
            <input
              value={form.edition}
              maxLength={100}
              onChange={(event) =>
                updateFormField("edition", event.target.value)
              }
              className={cyberInputClass}
            />
          </label>

          {/* Activation Region dropdown */}
          <label className="space-y-2">
            <span className="text-xs font-bold text-gray-400">
              {t("region")}
            </span>
            <select
              value={form.activationRegion}
              onChange={(event) =>
                updateFormField("activationRegion", event.target.value)
              }
              className={cyberInputClass}
            >
              {regionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {/* Delivery speed type */}
          <label className="space-y-2">
            <span className="text-xs font-bold text-gray-400">
              {t("delivery")}
            </span>
            <select
              value={form.delivery}
              onChange={(event) =>
                updateFormField("delivery", event.target.value)
              }
              className={cyberInputClass}
            >
              {deliveryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {/* Image Uploader & Preview wrapper */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400">
              {t("image")}
            </span>
            <div className="grid grid-cols-[88px_1fr] gap-3">
              <div className="relative h-16 overflow-hidden rounded-lg border border-midnight-650 bg-black">
                <ProductImage
                  src={form.imageUrl}
                  alt="Product upload preview"
                  sizes="88px"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <label
                  className={`${cyberPrimaryButtonClass} h-10 cursor-pointer px-3 text-sm`}
                >
                  <Upload className="h-4 w-4" />
                  {t("uploadImage")}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={isUploading || isSaving}
                    onChange={handleUploadImage}
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  disabled={isUploading || isSaving}
                  onClick={() =>
                    updateFormField("imageUrl", imageOptions[0].value)
                  }
                  className={`${cyberGhostButtonClass} h-8 px-3 text-xs text-steel-300`}
                >
                  <X className="h-3.5 w-3.5" />
                  {t("reset")}
                </button>
              </div>
            </div>
          </div>

          {/* Currency Mappings & Price amount */}
          <label className="space-y-2">
            <span className="text-xs font-bold text-gray-400">
              {t("price")}
            </span>
            <div className="grid grid-cols-[74px_1fr] gap-2">
              <input
                value={form.currency}
                aria-label="Currency"
                onChange={(event) =>
                  updateFormField("currency", event.target.value)
                }
                className={cyberInputClass}
              />
              <input
                value={form.price}
                aria-label={t("price")}
                type="number"
                min="0"
                step="0.01"
                onChange={(event) =>
                  updateFormField("price", event.target.value)
                }
                className={cyberInputClass}
              />
            </div>
          </label>

          {/* Stock inventory units count */}
          <label className="space-y-2">
            <span className="text-xs font-bold text-gray-400">
              {t("stock")}
            </span>
            <input
              value={form.stock}
              type="number"
              min="0"
              step="1"
              onChange={(event) =>
                updateFormField("stock", event.target.value)
              }
              className={cyberInputClass}
            />
          </label>

          {/* Product description area */}
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold text-gray-400">
              {t("description")}
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateFormField("description", event.target.value)
              }
              className={cyberTextareaClass}
              placeholder="Delivery notes, warranty, activation details"
            />
          </label>
        </div>

        {/* Error notice banner */}
        {formError ? (
          <p role="alert" className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {formError}
          </p>
        ) : null}

        {/* Form Submission action buttons */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isSaving || isUploading}
            onClick={() => handleSaveListing("draft")}
            className={`${cyberGhostButtonClass} h-11 px-5 text-sm`}
          >
            <Archive className="h-4 w-4" />
            {t("saveDraft")}
          </button>
          <button
            type="button"
            disabled={isSaving || isUploading}
            onClick={() => handleSaveListing("published")}
            className={`${cyberPrimaryButtonClass} h-11 px-5 text-sm`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSaving ? "Saving…" : isUploading ? "Uploading image…" : t("publishNow")}
          </button>
        </div>
      </div>

      {/* Right Column: Live card preview panel */}
      <div className={`${cyberPanelClass} min-w-0 overflow-hidden p-4`}>
        <p className="text-xs font-bold tracking-[0.16em] text-forest-500 uppercase">
          {t("preview")}
        </p>
        <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-xl border border-midnight-650 bg-black">
          <ProductImage
            src={form.imageUrl}
            alt={form.title || "Product preview"}
            sizes="320px"
          />
        </div>
        <h3 className="mt-4 line-clamp-2 text-lg font-bold text-white">
          {form.title || t("newProduct")}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md border border-midnight-650 bg-midnight-900/60 px-2.5 py-1 text-gray-300">
            {form.productType}
          </span>
          <span className="rounded-md border border-midnight-650 bg-midnight-900/60 px-2.5 py-1 text-gray-300">
            {form.platform}
          </span>
          <span className="rounded-md border border-midnight-650 bg-midnight-900/60 px-2.5 py-1 font-bold text-forest-500">
            {form.delivery}
          </span>
        </div>
        
        {/* Real-time total calculation info */}
        <div className="mt-5 grid gap-2 border-t border-midnight-700/60 pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <span className="text-xs text-steel-500">Total amount</span>
          <span className="min-w-0 text-left text-2xl leading-tight font-bold break-words text-forest-500 sm:text-right">
            {form.currency} {Number(form.price || 0).toFixed(2)}
          </span>
        </div>
      </div>

    </div>
  );
}
