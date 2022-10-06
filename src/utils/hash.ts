import crypto, { BinaryLike } from "crypto";

export const md5 = (data: BinaryLike) =>
  crypto.createHash("md5").update(data).digest("hex");
