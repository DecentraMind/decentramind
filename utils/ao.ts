import { message, result } from '@permaweb/aoconnect'
import type { z } from 'zod'

type SignerSchema = z.ZodFunction<z.ZodTuple<[z.ZodObject<{
  data: z.ZodAny;
  tags: z.ZodArray<z.ZodObject<{
      name: z.ZodString;
      value: z.ZodString;
  }, 'strip', z.ZodTypeAny, {
      name?: string;
      value?: string;
  }, {
      name?: string;
      value?: string;
  }>, 'many'>;
  /**
   * target must be set with writeMessage,
   * but not for createProcess
   */
  target: z.ZodOptional<z.ZodString>;
  anchor: z.ZodOptional<z.ZodString>;
}, 'strip', z.ZodTypeAny, {
  data?: any;
  tags?: {
      name?: string;
      value?: string;
  }[];
  target?: string;
  anchor?: string;
}, {
  data?: any;
  tags?: {
      name?: string;
      value?: string;
  }[];
  target?: string;
  anchor?: string;
}>], z.ZodUnknown>, z.ZodPromise<z.ZodObject<{
  id: z.ZodString;
  raw: z.ZodAny;
}, 'strip', z.ZodTypeAny, {
  id?: string;
  raw?: any;
}, {
  id?: string;
  raw?: any;
}>>>
export type Types = {
  signer: z.infer<SignerSchema>;
}
export type SendMessageArgs = {
  process: string;
  data?: string;
  tags?: {
      name: string;
      value: string;
  }[];
  anchor?: string;
  signer: Types['signer'];
}

export async function messageResult(messageParams: SendMessageArgs) {
  const messageId = await message(messageParams)
  const res = await result({ process: messageParams.process, message: messageId })
  checkResult(res)
}