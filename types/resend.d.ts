declare module "resend" {
  export interface SendEmailOptions {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    react?: unknown;
  }

  export class Resend {
    constructor(apiKey?: string);
    emails: {
      send(options: SendEmailOptions): Promise<unknown>;
    };
  }
}
