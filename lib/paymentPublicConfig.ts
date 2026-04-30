/**
 * Public payment instructions (mobile money QR + account text). Shown on /pay/[id].
 * Update images in /public/payments/ if you replace the artwork.
 */
export const MOBILE_MONEY_QR = {
  moncash: {
    imageSrc: "/payments/moncash-qr.png",
    label: "MonCash (Digicel)",
    recipient: "Melschisedek Jean Baptiste",
    phoneDisplay: "+509 31 24 57 49",
    phoneRaw: "31245749",
  },
  natcash: {
    imageSrc: "/payments/natcash-qr.png",
    label: "NatCash",
    recipient: "JEAN BAPTISTE MELSCHISEDEK",
    phoneDisplay: "+509 55 41 12 53",
    phoneRaw: "50955411253",
  },
} as const;
