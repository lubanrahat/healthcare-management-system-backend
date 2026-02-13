export interface MailgenContent {
  body: {
    name: string;
    intro: string | string[];
    dictionary?: Record<string, string>;
    action?: {
      instructions: string;
      button: {
        color?: string;
        text: string;
        link: string;
      };
    };
    outro: string | string[];
  };
}

export interface SendEmailOptions {
  email: string;
  subject: string;
  mailgenContent: MailgenContent;
}
