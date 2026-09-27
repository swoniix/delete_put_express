declare namespace NodeJS{
    interface ProcessEnv{
        PORT: string,
        HOST: string,
        DB_HOST :string,
        DB_PORT :string,
        DB_USER:string,
        DB_PASSWORD:string,
        DB_NAME:string,
        PATH_TO_JSON_SERVER: string
    }
}