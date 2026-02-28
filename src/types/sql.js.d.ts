declare module "sql.js" {
  interface InitSqlJsConfig {
    locateFile?: (file: string) => string;
  }
  interface SqlJsDatabase {
    run(sql: string, ...params: unknown[]): void;
    exec(sql: string): { values: unknown[][] }[];
    export(): Uint8Array;
    close(): void;
  }
  interface SqlJsStatic {
    Database: new (data?: Buffer | Uint8Array) => SqlJsDatabase;
  }
  function initSqlJs(config?: InitSqlJsConfig): Promise<SqlJsStatic>;
  export default initSqlJs;
}
