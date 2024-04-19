declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JSON_UPLOAD_SECRET: string;
    }
  }
}

export {};
